import { load } from "cheerio";
import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { extractPdf } from "./extract";
import { fetchOfficial } from "./transport";
import { httpsUrl } from "./candidate";

export function fold(s: string) {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
export function canonical(raw: string, base?: string) {
  try {
    const u = new URL(raw, base);
    u.hash = "";
    return httpsUrl.parse(u.href);
  } catch {
    return "";
  }
}
export type DocumentText = {
  url: string;
  title: string;
  blocks: { text: string; page: number | null }[];
  links: { url: string; label: string; next: boolean; page?: number }[];
};
export function parseDocument(
  body: Buffer,
  url: string,
  mime: string,
): DocumentText {
  if (mime === "application/pdf") {
    const pages = extractPdf(body);
    const blocks = pages
      .flatMap((p) =>
        p.text
          .split(/\n+/)
          .map((text) => ({ text: text.trim(), page: p.pageNumber })),
      )
      .filter((b) => b.text);
    const links = pages
      .flatMap((p) =>
        (p.links ?? []).map((l) => ({
          url: canonical(l.url),
          label: l.label,
          next: false,
          page: p.pageNumber,
        })),
      )
      .filter((l) => l.url);
    return { url, title: blocks[0]?.text ?? "", blocks, links };
  }
  const $ = load(body.toString("utf8"));
  $("script,style,footer,nav,aside,noscript,form").remove();
  const root = $("main,article").first().length
    ? $("main,article").first()
    : $("body");
  const links = root
    .find("a[href]")
    .toArray()
    .map((a) => ({
      url: canonical($(a).attr("href")!, url),
      label: $(a).text().trim(),
      next: $(a).attr("rel") === "next",
    }))
    .filter((l) => l.url)
    .slice(0, 300);
  const title = (root.find("h1").first().text() || $("title").text()).trim();
  const blocks = root
    .find("p,li,tr,h2,h3,dd")
    .toArray()
    .map((e) => ({ text: $(e).text().replace(/\s+/g, " ").trim(), page: null }))
    .filter((b) => b.text);
  return { url, title, blocks, links };
}

export function documentReader(
  db: PrismaClient,
  allowed: Set<string>,
  budget: number,
  get = fetchOfficial,
) {
  const seen = new Map<string, Promise<DocumentText>>();
  const stats = { requested: 0, reused: 0, parsed: 0 };
  async function read(url: string) {
    if (stats.requested >= budget)
      throw Error("Límite de documentos alcanzado");
    stats.requested++;
    const old = await db.searchDocument.findUnique({ where: { url } });
    const cached = old?.payload as unknown as DocumentText | undefined;
    const headers: Record<string, string> = {};
    if (old?.etag) headers["If-None-Match"] = old.etag;
    if (old?.modified) headers["If-Modified-Since"] = old.modified;
    const response = await get(
      url,
      allowed,
      undefined,
      undefined,
      cached ? { url: cached.url, headers } : undefined,
    );
    const hash =
      response.status === 304
        ? old!.hash
        : createHash("sha256")
            .update(response.mime)
            .update(response.body)
            .digest("hex");
    if (cached && cached.url === response.url && hash === old?.hash) {
      stats.reused++;
      return cached;
    }
    const payload = parseDocument(response.body, response.url, response.mime);
    stats.parsed++;
    const data = {
      hash,
      payload,
      etag: response.etag ?? null,
      modified: response.modified ?? null,
    };
    await db.searchDocument.upsert({
      where: { url },
      update: data,
      create: { url, ...data },
    });
    return payload;
  }
  return {
    stats,
    read(url: string) {
      if (!seen.has(url)) seen.set(url, read(url));
      return seen.get(url)!;
    },
  };
}
