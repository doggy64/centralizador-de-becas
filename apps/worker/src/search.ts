import { PrismaClient, SearchJob } from "@prisma/client";
import { setTimeout as delay } from "node:timers/promises";
import { analyze } from "./search-candidate";
import {
  canonical,
  documentReader,
  fold,
  DocumentText,
} from "./search-document";
import { importCandidate, review, verifyChannel } from "./editorial";
import { jobFetcher } from "./transport";

const actor = "worker-busquedas";
type Outcome = { url: string; status: string; reason?: string; slug?: string };
type Checkpoint = {
  queue: string[];
  results: Outcome[];
  documents?: { requested: number; parsed: number; reused: number };
};
const detailUrl = (slug: string) =>
  new URL(
    "/api/v1/scholarships/" + encodeURIComponent(slug),
    process.env.SEARCH_CATALOG_URL ?? "http://127.0.0.1:3001",
  );
async function webResults(query: string) {
  if (!process.env.BRAVE_SEARCH_API_KEY) return [];
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.search = new URLSearchParams({ q: query, count: "10" }).toString();
  const res = await fetch(url, {
    headers: { "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw Error("Buscador HTTP " + res.status);
  const body = (await res.json()) as { web?: { results?: { url: string }[] } };
  return (body.web?.results ?? []).map((r) => canonical(r.url)).filter(Boolean);
}
export async function runSearch(
  db: PrismaClient,
  job: SearchJob,
  get = jobFetcher(),
  check = async (slug: string) => {
    const res = await fetch(detailUrl(slug), {
      signal: AbortSignal.timeout(10000),
    });
    return res.ok && ((await res.json()) as { slug?: string }).slug === slug;
  },
) {
  const sources = await db.source.findMany({
    where: { approved: true, crawlAllowed: true },
    orderBy: { host: "asc" },
  });
  const hosts = new Map(sources.map((s) => [s.host, s]));
  const [areas, countries] = await Promise.all([
    db.studyArea.findMany(),
    db.country.findMany(),
  ]);
  const allowed = new Set(hosts.keys());
  const publishHosts = new Set(
    (process.env.SEARCH_PUBLISH_HOSTS ?? "").split(",").map((s) => s.trim()),
  );
  const previous = job.report as Partial<Checkpoint>;
  const reader = documentReader(db, allowed, 40, get);
  Object.assign(reader.stats, previous.documents);
  const queue =
    previous.queue ?? sources.map((s) => s.officialUrl).slice(0, 30);
  const results = previous.results ?? [];
  const save = async (status: string) => {
    await db.searchJob.update({
      where: { id: job.id },
      data: {
        status,
        report: {
          queue,
          results,
          documents: reader.stats,
          published: results.filter((r) => r.status === "PUBLISHED").length,
          pending: results.filter((r) =>
            ["ERROR", "NEEDS_REVIEW", "SOURCE_REVIEW"].includes(r.status),
          ).length,
        },
      },
    });
  };
  if (!previous.queue) {
    try {
      for (const url of await webResults(job.query)) {
        if (!allowed.has(new URL(url).hostname))
          results.push({
            url,
            status: "SOURCE_REVIEW",
            reason: "Fuente pendiente de autorización",
          });
        else if (!queue.includes(url) && queue.length < 30) queue.push(url);
      }
    } catch {
      results.push({
        url: "",
        status: "ERROR",
        reason: "Buscador externo no disponible",
      });
    }
    if (!queue.length)
      results.push({
        url: "",
        status: "NEEDS_REVIEW",
        reason: "No hay fuentes con permiso de rastreo",
      });
    await save("RUNNING");
  }
  for (const url of queue) {
    if (results.some((r) => r.url === url)) continue;
    try {
      const main = await reader.read(url);
      const source = hosts.get(new URL(main.url).hostname)!;
      const annexes: DocumentText[] = [];
      const attachments = main.links.filter(
        (l) =>
          /\.pdf(?:$|\?)/i.test(l.url) ||
          /^(bases|guidelines|reglamento|bases de la convocatoria)$/i.test(
            l.label.trim(),
          ),
      );
      const links = main.links.filter(
        (l) =>
          !attachments.includes(l) &&
          (l.next ||
            /beca|scholarship|studentship|convocatoria/.test(
              fold(l.label + " " + l.url),
            )),
      );
      for (const link of links)
        if (
          allowed.has(new URL(link.url).hostname) &&
          !queue.includes(link.url) &&
          queue.length < 30
        )
          queue.push(link.url);
      const annexUrls = new Set(attachments.map((l) => l.url));
      if (annexUrls.size > 4)
        throw Error("Demasiados anexos para atribuirlos a una sola edición");
      for (const link of annexUrls) {
        const doc = await reader.read(link);
        if (!doc.blocks.length) throw Error("Anexo sin texto legible");
        annexes.push(doc);
      }
      const { candidate, reason } = analyze(job.query, source, main, annexes, {
        areas,
        countries,
      });
      if (!candidate)
        results.push({
          url,
          status:
            reason === "Fuera de la consulta" ? "SKIPPED" : "NEEDS_REVIEW",
          reason,
        });
      else {
        const slug = candidate.slug;
        const existing = await db.scholarship.findFirst({
          where: {
            sourceUrl: main.url,
            slug: { not: slug },
            OR: [
              { editionKey: candidate.editionKey },
              { title: candidate.title },
            ],
          },
        });
        if (existing)
          throw Error("Ya existe una ficha editorial para esta edición");
        const imported = await importCandidate(
          db,
          candidate,
          actor,
          false,
          true,
        );
        const current = await db.scholarship.findUniqueOrThrow({
          where: { slug },
          include: { channels: true },
        });
        let published = current.status === "PUBLISHED";
        if (published && reason === "Elegibilidad para Bolivia sin confirmar") {
          results.push({ url, slug, status: "NEEDS_REVIEW", reason });
          await save("RUNNING");
          continue;
        }
        const mayPublish = job.publish && publishHosts.has(source.host);
        const stale =
          !current.lastVerifiedAt ||
          Date.now() - current.lastVerifiedAt.getTime() >= 30 * 86400000;
        if (published && mayPublish && (reason || stale)) {
          await review(
            db,
            slug,
            "recheck",
            actor,
            reason || "Renovar la comprobación de fuente y canal",
            imported.hash,
          );
          published = false;
        }
        if (current.status === "DRAFT")
          await review(
            db,
            slug,
            "submit",
            actor,
            "Extracción con evidencia oficial",
            imported.hash,
          );
        if (!published && mayPublish && !reason) {
          for (const c of current.channels)
            await verifyChannel(
              db,
              c.id,
              actor,
              "Designación en la convocatoria oficial",
              "VERIFIED",
              get,
            );
          await review(
            db,
            slug,
            "publish",
            actor,
            "Reglas de publicación verificadas",
            imported.hash,
          );
          published = true;
        }
        if (published && !(await check(slug)))
          results.push({
            url,
            slug,
            status: "ERROR",
            reason: "Publicada, pendiente de verificar en el catálogo",
          });
        else
          results.push({
            url,
            slug,
            status: published ? "PUBLISHED" : "NEEDS_REVIEW",
            ...(!published
              ? {
                  reason:
                    reason ||
                    "Publicación automática desactivada para esta solicitud o fuente",
                }
              : {}),
          });
      }
    } catch (err) {
      results.push({
        url,
        status: "NEEDS_REVIEW",
        reason:
          err instanceof Error && err.constructor === Error
            ? err.message
            : "Fallo de acceso, validación o almacenamiento",
      });
    }
    await save("RUNNING");
  }
  await save(
    results.some((r) =>
      ["NEEDS_REVIEW", "ERROR", "SOURCE_REVIEW"].includes(r.status),
    )
      ? "DONE_WITH_ISSUES"
      : "DONE",
  );
}

export async function processNext(db: PrismaClient, execute = runSearch) {
  // The transaction owns only the worker lock. Checkpoints commit independently.
  return db.$transaction(
    async (tx) => {
      const [lock] = await tx.$queryRaw<
        { ok: boolean }[]
      >`SELECT pg_try_advisory_xact_lock(76813021) AS ok`;
      if (!lock.ok) return false;
      const job = await db.searchJob.findFirst({
        where: { status: { in: ["QUEUED", "RUNNING"] } },
        orderBy: { createdAt: "asc" },
      });
      if (!job) return false;
      await execute(db, job);
      return true;
    },
    { timeout: 8 * 3600000 },
  );
}
export async function serveSearch(db: PrismaClient) {
  let stopping = false;
  for (const signal of ["SIGINT", "SIGTERM"])
    process.once(signal, () => {
      stopping = true;
    });
  while (!stopping) {
    try {
      if (await processNext(db)) continue;
    } catch {
      console.error(
        "Trabajo pendiente de reintento. Revise acceso a PostgreSQL y migraciones.",
      );
    }
    await delay(3000);
  }
}
