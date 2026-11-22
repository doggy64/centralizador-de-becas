import { load } from "cheerio";
import { BasicCrawler } from "@crawlee/basic";
import { Configuration, Request } from "@crawlee/core";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { candidateFields } from "./candidate";
import { importCandidate } from "./editorial";
import { fetchOfficial } from "./transport";

export function extractHtml(html: Buffer, url: string) {
  const $ = load(html.toString("utf8"));
  $("script,style,nav,footer,header,aside,form,noscript").remove();
  const content = $("main, article").first();
  const root = content.length ? content : $("body");
  const title =
    root.find("h1").first().text().trim() || $("title").text().trim();
  const paragraph =
    root
      .find("p")
      .map((_, p) => $(p).text().trim())
      .get()
      .find(Boolean) ?? "";
  const links = root
    .find("a[href]")
    .map((_, a) => {
      try {
        return new URL($(a).attr("href")!, url).href;
      } catch {
        return "";
      }
    })
    .get()
    .filter((s) => s.startsWith("https://"));
  const next = $('[rel~="next"]').first().attr("href");
  return {
    title,
    summary: paragraph.slice(0, 2000),
    links: [...new Set(links)].slice(0, 200),
    next: next ? new URL(next, url).href : null,
    pageNumber: null,
  };
}
export function extractPdf(bytes: Buffer) {
  const result = spawnSync(
    process.env.PYTHON_BIN ?? "python",
    [path.join(__dirname, "../scripts/extract_pdf.py")],
    {
      input: bytes,
      timeout: 90000,
      maxBuffer: 8 * 1024 * 1024,
      encoding: "utf8",
      windowsHide: true,
    },
  );
  if (result.status !== 0)
    throw new Error("PDF ilegible o motor PyMuPDF no disponible");
  return z
    .array(
      z.object({
        text: z.string(),
        pageNumber: z.number().int().positive(),
        links: z
          .array(z.object({ url: z.string(), label: z.string() }))
          .optional(),
      }),
    )
    .parse(JSON.parse(result.stdout));
}
export async function ingest(
  db: PrismaClient,
  raw: string,
  identity: unknown,
  actor: string,
  get = fetchOfficial,
) {
  const config = candidateFields
    .pick({ institution: true, program: true, editionKey: true, slug: true })
    .strict()
    .parse(identity);
  const host = new URL(raw).hostname;
  const hosts = new Set(
    (
      await db.source.findMany({
        where: { approved: true, crawlAllowed: true },
        select: { host: true },
      })
    ).map((s) => s.host),
  );
  if (!hosts.has(host)) throw new Error("Fuente sin permiso de rastreo");
  const run = await db.ingestionRun.create({
    data: { host, url: raw, status: "RUNNING" },
  });
  try {
    const res = await get(new Request({ url: raw }).url, hosts);
    const hash = createHash("sha256").update(res.body).digest("hex");
    let title: string, summary: string, pageNumber: number | null;
    if (res.mime === "application/pdf") {
      const pages = extractPdf(res.body);
      title = config.program.name;
      summary = pages[0]?.text.slice(0, 2000) ?? "";
      pageNumber = pages[0]?.pageNumber ?? null;
    } else {
      ({ title, summary, pageNumber } = extractHtml(res.body, res.url));
    }
    if (!title || !summary) {
      await db.ingestionRun.update({
        where: { id: run.id },
        data: { status: "NEEDS_REVIEW", hash, finishedAt: new Date() },
      });
      return { status: "NEEDS_REVIEW", id: run.id };
    }
    const result = await importCandidate(
      db,
      {
        ...config,
        title,
        summary,
        sourceUrl: res.url,
        evidence: { sourceUrl: res.url, excerpt: summary, pageNumber },
      },
      actor,
    );
    await db.ingestionRun.update({
      where: { id: run.id },
      data: { status: "DONE", hash, finishedAt: new Date() },
    });
    return result;
  } catch (error) {
    await db.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        message: "Fallo de acceso, extracción o normalización",
        finishedAt: new Date(),
      },
    });
    throw error;
  }
}
export async function discover(
  db: PrismaClient,
  raw: string,
  get = fetchOfficial,
) {
  const allowed = new Set(
    (
      await db.source.findMany({
        where: { approved: true, crawlAllowed: true },
      })
    ).map((s) => s.host),
  );
  const found = new Set<string>();
  const config = new Configuration({ persistStorage: false });
  let failed = false;
  const crawler = new BasicCrawler(
    {
      maxConcurrency: 1,
      // Follow a bounded set of same-host links so aggregator pages can lead
      // to individual programme pages (root -> listing -> programme).
      maxRequestsPerCrawl: 30,
      maxRequestRetries: 0,
      requestHandlerTimeoutSecs: 360,
      async requestHandler({ request, addRequests }) {
        const res = await get(request.url, allowed);
        if (res.mime !== "text/html") return;
        const page = extractHtml(res.body, res.url);
        const internal = page.links.filter((link) => {
          const url = new URL(link);
          return allowed.has(url.hostname) && url.protocol === "https:";
        });
        for (const link of internal) found.add(link);
        const next = page.next && allowed.has(new URL(page.next).hostname)
          ? [page.next]
          : [];
        await addRequests([...new Set([...internal, ...next])]);
      },
      async failedRequestHandler() {
        failed = true;
      },
    },
    config,
  );
  await crawler.run([raw]);
  if (failed) throw new Error("La fuente impidió completar el descubrimiento");
  return [...found];
}
