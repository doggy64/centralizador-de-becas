import { parseArgs } from "node:util";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import { serveSearch } from "./search";
import { discover, ingest } from "./extract";
import { httpsUrl } from "./candidate";
import { importCandidate, review, verifyChannel } from "./editorial";

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      health: { type: "boolean" },
      help: { type: "boolean" },
      "dry-run": { type: "boolean" },
      actor: { type: "string" },
      note: { type: "string" },
    },
  });
  if (values.health) {
    console.log(JSON.stringify({ status: "ok" }));
    return;
  }
  if (values.help || !positionals.length) {
    console.log(
      "serve | pilot | discover URL | ingest URL IDENTIDAD.json | source URL manual/crawl/disable | import ARCHIVO | inspect SLUG | submit/publish/reject/recheck/retire SLUG | channel ID VERIFIED/INVALID/STALE. Use --actor y --note para revisión.",
    );
    return;
  }
  const [action, arg, decision] = positionals;
  const actor = values.actor ?? "";
  const note = values.note ?? "";
  if (!arg && action !== "pilot" && action !== "serve")
    throw new Error("Falta argumento");
  if (values["dry-run"] && action !== "import" && action !== "pilot")
    throw new Error("Dry-run solo para importación");
  if (process.env.WORKER_DATABASE_URL)
    process.env.DATABASE_URL = process.env.WORKER_DATABASE_URL;
  const db = new PrismaClient();
  try {
    if (action === "serve") await serveSearch(db);
    else if (action === "import" || action === "pilot") {
      const files =
        action === "pilot"
          ? ["chevening", "oea", "university-college"].map((name) =>
              path.join(__dirname, "../data", name + ".json"),
            )
          : [arg];
      let count = 0;
      for (const file of files) {
        const input: unknown = JSON.parse(await readFile(file, "utf8"));
        for (const record of Array.isArray(input) ? input : [input]) {
          await importCandidate(db, record, actor, values["dry-run"]);
          count++;
        }
      }
      console.log(
        JSON.stringify({
          processed: count,
          dryRun: values["dry-run"] ?? false,
        }),
      );
    } else if (action === "discover")
      console.log(JSON.stringify(await discover(db, arg)));
    else if (action === "ingest")
      console.log(
        await ingest(
          db,
          arg,
          JSON.parse(await readFile(decision, "utf8")),
          actor,
        ),
      );
    else if (action === "source") {
      const url = new URL(httpsUrl.parse(arg));
      if (
        !actor.trim() ||
        !note.trim() ||
        !["manual", "crawl", "disable"].includes(decision)
      )
        throw new Error("Se requiere política, operador y motivo");
      const policy = {
        approved: decision !== "disable",
        crawlAllowed: decision === "crawl",
        policyNote: JSON.stringify({ actor, note, at: new Date() }),
      };
      await db.source.upsert({
        where: { host: url.hostname },
        update: policy,
        create: {
          host: url.hostname,
          title: url.hostname,
          officialUrl: url.href,
          ...policy,
        },
      });
    } else if (action === "inspect")
      console.log(
        JSON.stringify(
          await db.scholarship.findUniqueOrThrow({
            where: { slug: arg },
            include: {
              program: { include: { institution: true } },
              source: true,
              levels: true,
              areas: true,
              countries: true,
              requirements: true,
              benefits: true,
              channels: true,
              evidence: true,
              events: true,
            },
          }),
          null,
          2,
        ),
      );
    else if (
      action === "channel" &&
      (decision === "VERIFIED" ||
        decision === "INVALID" ||
        decision === "STALE")
    )
      await verifyChannel(db, arg, actor, note, decision);
    else await review(db, arg, action, actor, note);
  } finally {
    await db.$disconnect();
  }
}
main().catch((error: unknown) => {
  const controlled = error instanceof Error && error.constructor === Error;
  console.error(
    controlled
      ? error.message
      : "Operación rechazada. Revise la entrada, configuración y estado de la base.",
  );
  process.exitCode = 2;
});
