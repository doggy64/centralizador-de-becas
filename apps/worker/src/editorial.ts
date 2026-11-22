import { createHash } from "node:crypto";
import { Prisma, PrismaClient, Editorial } from "@prisma/client";
import { fetchOfficial } from "./transport";
import { candidateSchema, Proof } from "./candidate";

const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
function fold(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
function operator(actor: string) {
  if (!actor.trim() || actor.length > 120)
    throw new Error("Operador requerido");
}
async function lock(tx: Prisma.TransactionClient, key: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key},0))`;
}
export async function importCandidate(
  db: PrismaClient,
  input: unknown,
  actor: string,
  dryRun = false,
  automatic = false,
) {
  operator(actor);
  const c = candidateSchema.parse(input);
  const proofList: [string, Proof][] = [
    ["summary", c.evidence],
    ...Object.entries(c.fieldEvidence).map(([field, p]): [string, Proof] => [
      field,
      p!,
    ]),
    ...c.requirements.map((x): [string, Proof] => ["requirement", x.evidence]),
    ...c.documents.map((x): [string, Proof] => ["document", x.evidence]),
    ...c.benefits.map((x): [string, Proof] => ["benefit", x.evidence]),
    ...c.channels.map((x): [string, Proof] => ["channel", x.evidence]),
  ];
  const host = new URL(c.sourceUrl).hostname;
  const hash = digest({
    ...c,
    sourceUrl: undefined,
    evidence: undefined,
    requirements: c.requirements.map((x) => [x.label, x.required]),
    documents: c.documents.map((x) => [x.label, x.required]),
    benefits: c.benefits.map((x) => [x.description, x.amount, x.currency]),
    channels: c.channels.map((x) => [x.type, x.purpose, x.target]),
  });
  const rollback = new Error("dry-run");
  let id = "";
  try {
    await db.$transaction(
      async (tx) => {
        await lock(tx, c.slug);
        for (const hostname of new Set(
          proofList.map(([, p]) => new URL(p.sourceUrl).hostname),
        )) {
          if (
            !(await tx.source.findFirst({
              where: { host: hostname, approved: true },
            }))
          )
            throw new Error("Fuente sin aprobación institucional");
        }
        const institution = await tx.institution.upsert({
          where: { id: c.institution.key },
          update: {},
          create: {
            id: c.institution.key,
            name: c.institution.name,
            websiteUrl: c.institution.websiteUrl,
          },
        });
        const program = await tx.program.upsert({
          where: {
            institutionId_key: {
              institutionId: institution.id,
              key: c.program.key,
            },
          },
          update: {},
          create: {
            institutionId: institution.id,
            key: c.program.key,
            name: c.program.name,
          },
        });
        if (
          program.name !== c.program.name ||
          institution.name !== c.institution.name ||
          institution.websiteUrl !== c.institution.websiteUrl
        )
          throw new Error("Identidad del programa o institución en conflicto");
        const where = {
          programId_editionKey: {
            programId: program.id,
            editionKey: c.editionKey,
          },
        };
        await lock(tx, program.id + "|" + c.editionKey);
        const old = await tx.scholarship.findUnique({ where });
        if (
          automatic &&
          old &&
          (old.sourceUrl !== c.sourceUrl ||
            (await tx.reviewEvent.count({
              where: { callId: old.id, actor: { not: actor } },
            })))
        )
          throw new Error("La edición tiene intervención editorial previa");
        const values = {
          title: c.title,
          summary: c.summary,
          contentHash: hash,
          modality: c.modality,
          coverage: c.coverage,
          startDate: c.startDate ?? null,
          deadlineDay: c.deadlineDay ?? null,
          deadlineAt: c.deadlineAt ? new Date(c.deadlineAt) : null,
          timeZone: c.timeZone ?? null,
          originalDeadlineText: c.originalDeadlineText ?? null,
          searchText: fold(
            [
              c.title,
              c.summary,
              c.program.name,
              c.institution.name,
              ...c.areas,
            ].join(" "),
          ),
        };
        const changed = old?.contentHash !== hash;
        const call =
          old ??
          (await tx.scholarship.create({
            data: {
              ...values,
              slug: c.slug,
              programId: program.id,
              editionKey: c.editionKey,
              sourceUrl: c.sourceUrl,
              sourceHost: host,
            },
          }));
        id = call.id;
        const proofs = new Map<string, string>();
        for (const [field, p] of proofList) {
          const recordedField = Object.hasOwn(c.fieldEvidence, field)
            ? hash + ":" + field
            : field;
          const fingerprint = digest([recordedField, p]);
          const proof = await tx.evidence.upsert({
            where: { callId_fingerprint: { callId: id, fingerprint } },
            update: {},
            create: {
              callId: id,
              host: new URL(p.sourceUrl).hostname,
              url: p.sourceUrl,
              field: recordedField,
              excerpt: p.excerpt,
              pageNumber: p.pageNumber,
              fingerprint,
            },
          });
          proofs.set(fingerprint, proof.id);
        }
        if (changed) {
          const counts = await Promise.all([
            tx.academicLevel.count({ where: { value: { in: c.levels } } }),
            tx.studyArea.count({ where: { value: { in: c.areas } } }),
            tx.country.count({ where: { value: { in: c.countries } } }),
          ]);
          if (
            [c.levels, c.areas, c.countries].some(
              (list, i) => counts[i] !== new Set(list).size,
            )
          )
            throw new Error("Taxonomía desconocida");
          const refs = (list: string[]) => list.map((value) => ({ value }));
          await tx.scholarship.update({
            where: { id },
            data: {
              ...values,
              sourceUrl: c.sourceUrl,
              sourceHost: host,
              status: "DRAFT",
              lastVerifiedAt: null,
              levels: { set: refs(c.levels) },
              areas: { set: refs(c.areas) },
              countries: { set: refs(c.countries) },
            },
          });
          await tx.requirement.deleteMany({ where: { callId: id } });
          await tx.benefit.deleteMany({ where: { callId: id } });
          await tx.channel.deleteMany({ where: { callId: id } });
          const ref = (field: string, p: Proof) =>
            proofs.get(digest([field, p]))!;
          for (const [document, items] of [
            [false, c.requirements],
            [true, c.documents],
          ] as const)
            for (const x of items)
              await tx.requirement.create({
                data: {
                  callId: id,
                  document,
                  label: x.label,
                  required: x.required,
                  evidenceId: ref(
                    document ? "document" : "requirement",
                    x.evidence,
                  ),
                },
              });
          for (const x of c.benefits)
            await tx.benefit.create({
              data: {
                callId: id,
                description: x.description,
                amount: x.amount,
                currency: x.currency,
                evidenceId: ref("benefit", x.evidence),
              },
            });
          for (const x of c.channels)
            await tx.channel.create({
              data: {
                callId: id,
                type: x.type,
                purpose: x.purpose,
                target: x.target,
                evidenceId: ref("channel", x.evidence),
              },
            });
          await tx.reviewEvent.create({
            data: { callId: id, actor, action: "IMPORT", note: hash },
          });
        }
        if (dryRun) throw rollback;
      },
      { timeout: 30000 },
    );
  } catch (error) {
    if (error !== rollback) throw error;
  }
  return { id: dryRun ? null : id, dryRun, hash };
}

const transitions: Record<string, { from: Editorial[]; to: Editorial }> = {
  submit: { from: ["DRAFT", "REJECTED", "RETIRED"], to: "IN_REVIEW" },
  publish: { from: ["IN_REVIEW"], to: "PUBLISHED" },
  reject: { from: ["IN_REVIEW"], to: "REJECTED" },
  retire: { from: ["PUBLISHED"], to: "RETIRED" },
  recheck: { from: ["PUBLISHED"], to: "IN_REVIEW" },
};
export async function review(
  db: PrismaClient,
  slug: string,
  action: string,
  actor: string,
  note: string,
  expectedHash?: string,
) {
  operator(actor);
  const rule = Object.hasOwn(transitions, action) ? transitions[action] : null;
  if (!rule || !note.trim()) throw new Error("Acción o motivo inválido");
  return db.$transaction(async (tx) => {
    await lock(tx, slug);
    const call = await tx.scholarship.findUniqueOrThrow({
      where: { slug },
      include: {
        source: true,
        evidence: { include: { source: true } },
        channels: true,
      },
    });
    if (
      expectedHash &&
      (call.contentHash !== expectedHash ||
        (await tx.reviewEvent.count({
          where: { callId: call.id, actor: { not: actor } },
        })))
    )
      throw new Error("La edición cambió durante la automatización");
    if (!rule.from.includes(call.status))
      throw new Error("Transición editorial inválida");
    if (
      action === "publish" &&
      (!call.source.approved ||
        !call.evidence.length ||
        call.evidence.some((e) => !e.source.approved))
    )
      throw new Error("Procedencia pendiente de verificación");
    if (action === "publish") {
      const required = [
        "startDate",
        "deadlineDay",
        "deadlineAt",
        "timeZone",
        "modality",
        "coverage",
      ] as const;
      const current = new Set(
        call.evidence
          .filter((e) => e.field.startsWith(call.contentHash + ":"))
          .map((e) => e.field.slice(call.contentHash.length + 1)),
      );
      if (
        required.some(
          (key) => call[key] && call[key] !== "UNKNOWN" && !current.has(key),
        )
      )
        throw new Error("Falta evidencia de fechas o condiciones actuales");
    }
    const updated = await tx.scholarship.updateMany({
      where: {
        id: call.id,
        status: call.status,
        contentHash: call.contentHash,
      },
      data: {
        status: rule.to,
        lastVerifiedAt: action === "publish" ? new Date() : null,
      },
    });
    if (updated.count !== 1)
      throw new Error("La edición cambió durante la revisión");
    await tx.reviewEvent.create({
      data: { callId: call.id, actor, action, note },
    });
  });
}
export async function verifyChannel(
  db: PrismaClient,
  id: string,
  actor: string,
  note: string,
  decision: "VERIFIED" | "INVALID" | "STALE",
  checkUrl = fetchOfficial,
) {
  operator(actor);
  if (!note.trim()) throw new Error("Describa la comprobación manual");
  if (decision === "VERIFIED") {
    const c = await db.channel.findUniqueOrThrow({
      where: { id },
      include: { evidence: { include: { source: true } }, call: true },
    });
    const tokens = c.evidence.excerpt?.split(/[\s<>"'()]+/) ?? [];
    if (
      c.call.status !== "IN_REVIEW" ||
      !c.evidence.source.approved ||
      !tokens.some((t) => t === c.target || t === "mailto:" + c.target)
    )
      throw new Error("Falta designación exacta en la fuente oficial");
    if (c.type !== "EMAIL") {
      const allowed = new Set(
        (
          await db.source.findMany({
            where: { approved: true, crawlAllowed: true },
          })
        ).map((s) => s.host),
      );
      await checkUrl(c.target, allowed);
    }
  }
  await db.$transaction(async (tx) => {
    const initial = await tx.channel.findUniqueOrThrow({
      where: { id },
      include: { call: true },
    });
    await lock(tx, initial.call.slug);
    const c = await tx.channel.findUniqueOrThrow({
      where: { id },
      include: { evidence: { include: { source: true } }, call: true },
    });
    if (
      decision === "VERIFIED" &&
      (c.call.status !== "IN_REVIEW" ||
        !c.evidence.source.approved ||
        !c.evidence.excerpt?.includes(c.target))
    )
      throw new Error(
        "Falta designación explícita del canal en evidencia oficial o revisión pendiente",
      );
    await tx.channel.update({
      where: { id },
      data: { verification: decision, verifiedAt: new Date() },
    });
    await tx.reviewEvent.create({
      data: {
        callId: c.callId,
        actor,
        action: "CHANNEL_" + decision,
        note: id + " " + note,
      },
    });
  });
}
