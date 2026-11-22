import { createHash } from "node:crypto";
import { candidateSchema, Proof } from "./candidate";
import { DocumentText, fold } from "./search-document";

const key = (s: string) =>
  fold(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90)
    .replace(/-$/, "");
const ignored = new Set(
  "busca buscar busqueda beca becas convocatoria convocatorias scholarship scholarships de del la el las los y a para en por con postulantes estudiantes publicalo publica publicalas verificadas".split(
    " ",
  ),
);
const monthNames = [
  ["enero", "january"],
  ["febrero", "february"],
  ["marzo", "march"],
  ["abril", "april"],
  ["mayo", "may"],
  ["junio", "june"],
  ["julio", "july"],
  ["agosto", "august"],
  ["septiembre", "september"],
  ["octubre", "october"],
  ["noviembre", "november"],
  ["diciembre", "december"],
];
function deadline(text: string) {
  const value = fold(text).match(
    /^(?:fecha (?:limite(?: de postulacion)?|de cierre)|cierre|(?:application )?deadline)\s*:\s*(.+?)\.?$/,
  )?.[1];
  if (!value) return;
  if (/^20\d\d-\d\d-\d\d$/.test(value)) return value;
  const parts = value.match(/^(\d{1,2}) (?:de )?([a-z]+) (?:de )?(20\d\d)$/);
  if (!parts) return;
  const month = monthNames.findIndex((names) => names.includes(parts[2])) + 1;
  if (month)
    return [
      parts[3],
      String(month).padStart(2, "0"),
      parts[1].padStart(2, "0"),
    ].join("-");
}
export function analyze(
  query: string,
  source: { host: string; title: string },
  main: DocumentText,
  annexes: DocumentText[],
  taxonomy: {
    areas: { value: string; label: string }[];
    countries: { value: string; label: string }[];
  } = { areas: [], countries: [] },
) {
  const docs = [main, ...annexes];
  const rows = docs.flatMap((d) =>
    d.blocks.map((b) => ({
      text: b.text,
      proof: {
        sourceUrl: d.url,
        excerpt: b.text.slice(0, 2000),
        pageNumber: b.page,
      },
    })),
  );
  const text = fold([main.title, ...rows.map((r) => r.text)].join("\n"));
  const terms =
    fold(query)
      .match(/[a-z0-9]+/g)
      ?.filter((t) => !ignored.has(t)) ?? [];
  if (!terms.every((t) => text.includes(t)))
    return { reason: "Fuera de la consulta" };
  if (!/\bbecas?\b|scholarship|studentship/i.test(main.title))
    return { reason: "Sin título de convocatoria" };
  const lines = (pattern: RegExp) =>
    rows.filter((r) => pattern.test(fold(r.text)));
  function taxonomyValues(
    pattern: RegExp,
    catalog: { value: string; label: string }[],
  ) {
    const values = new Set(
      lines(pattern).flatMap((r) =>
        r.text
          .substring(r.text.indexOf(":") + 1)
          .split(/[,;]/)
          .map((s) => fold(s.trim())),
      ),
    );
    return catalog
      .filter(
        (item) => values.has(fold(item.value)) || values.has(fold(item.label)),
      )
      .map((item) => item.value);
  }
  const editionMatches = [
    ...new Set(
      main.title.match(/\b20\d{2}(?:\s*[-–/]\s*(?:20)?\d{2})?\b/g) ?? [],
    ),
  ];
  if (editionMatches.length !== 1)
    return { reason: "Edición ausente o ambigua" };
  const edition = editionMatches[0];
  const name = main.title
    .replace(edition, "")
    .replace(/\s*[-–:]\s*$/, "")
    .trim();
  const summary = main.blocks.find((b) => b.text.length >= 25);
  if (!summary || !key(name))
    return { reason: "Sin descripción o identidad suficiente" };
  const suffix = createHash("sha256")
    .update(source.host)
    .digest("hex")
    .slice(0, 8);
  const editionKey = key(edition);
  const slug = key(name) + "-" + suffix + "-" + editionKey;
  const dates = lines(/(?:fecha (?:limite|de cierre)|cierre|deadline)\b/);
  const parsed = dates.map((d) => deadline(d.text));
  const uniqueDates = new Set(parsed);
  const date = uniqueDates.size === 1 ? parsed[0] : undefined;
  const requirements = lines(
    /^(?:requisito|requirement|elegibilidad|eligibility)\s*:/,
  );
  const documents = lines(/^(?:documento|document required)\s*:/);
  const benefits = lines(/^(?:beneficio|benefit)\s*:/);
  const items = (entries: typeof rows) =>
    entries.map((r) => ({ label: r.text, required: null, evidence: r.proof }));
  const apply = docs
    .flatMap((doc) => doc.links.map((l) => ({ ...l, sourceUrl: doc.url })))
    .filter((l) =>
      /^(postular(?:se)?|postula aqui|apply(?: now)?|solicitar beca)$/i.test(
        fold(l.label),
      ),
    );
  const channel =
    new Set(apply.map((l) => l.url)).size === 1 ? apply[0] : undefined;
  const levels = (
    [
      ["MASTER", /\b(maestria|master'?s?)\b/],
      ["DOCTORATE", /\b(doctorado|doctoral|phd)\b/],
      ["UNDERGRADUATE", /\b(pregrado|undergraduate)\b/],
    ] as const
  )
    .filter(([, r]) => r.test(text))
    .map(([v]) => v);
  const fieldEvidence: Record<string, Proof> = {};
  if (date) fieldEvidence.deadlineDay = dates[0].proof;
  const conditions = (
    pattern: RegExp,
    values: Record<string, string>,
    field: string,
  ) => {
    const hits = lines(pattern);
    const options = [
      ...new Set(
        hits.map(
          (r) =>
            values[fold(r.text.split(":").slice(1).join(":").trim())] ??
            "UNKNOWN",
        ),
      ),
    ];
    if (options.length === 1 && options[0] !== "UNKNOWN") {
      fieldEvidence[field] = hits[0].proof;
      return options[0];
    }
    return "UNKNOWN";
  };
  const modality = conditions(
    /^modalidad\s*:/,
    { presencial: "ON_SITE", virtual: "ONLINE", hibrida: "HYBRID" },
    "modality",
  );
  const coverage = conditions(
    /^cobertura\s*:/,
    { total: "FULL", completa: "FULL", parcial: "PARTIAL" },
    "coverage",
  );
  const candidate = candidateSchema.parse({
    institution: {
      key: key(source.host) + "-" + suffix,
      name: source.title,
      websiteUrl: "https://" + source.host,
    },
    program: { key: key(name), name },
    editionKey,
    slug,
    title: main.title,
    summary: summary.text.slice(0, 2000),
    sourceUrl: main.url,
    evidence: {
      sourceUrl: main.url,
      excerpt: summary.text.slice(0, 2000),
      pageNumber: summary.page,
    },
    levels,
    countries: taxonomyValues(
      /^(?:pais de destino|destino|destination)\s*:/,
      taxonomy.countries,
    ),
    areas: taxonomyValues(
      /^(?:area de estudio|area|field of study)\s*:/,
      taxonomy.areas,
    ),
    modality,
    coverage,
    fieldEvidence,
    deadlineDay: date,
    originalDeadlineText: date ? dates[0].text : undefined,
    requirements: items(requirements),
    documents: items(documents),
    benefits: benefits.map((r) => ({
      description: r.text,
      amount: null,
      currency: null,
      evidence: r.proof,
    })),
    channels: channel
      ? [
          {
            type: "FORM_URL",
            purpose: "APPLY",
            target: channel.url,
            evidence: {
              sourceUrl: channel.sourceUrl,
              excerpt: channel.label + " " + channel.url,
              pageNumber: channel.page ?? null,
            },
          },
        ]
      : [],
  });
  const reasons: string[] = [];
  if (
    (modality === "UNKNOWN" && lines(/^modalidad\s*:/).length) ||
    (coverage === "UNKNOWN" && lines(/^cobertura\s*:/).length)
  )
    reasons.push("Modalidad o cobertura ambigua");
  if (!date || date <= new Date().toISOString().slice(0, 10))
    reasons.push("Cierre vencido, ausente o ambiguo");
  if (!channel || !requirements.length || !benefits.length)
    reasons.push("Falta canal, elegibilidad o beneficio verificable");
  if (
    terms.some((t) => t.startsWith("bolivi")) &&
    !requirements.some((r) =>
      /^(elegibilidad|requisito|eligibility|requirement):\s*(?:ciudadanos (?:de bolivia|bolivianos)|nacionales de bolivia|bolivian citizens|bolivian nationals)[.]?$/i.test(
        fold(r.text),
      ),
    )
  )
    reasons.push("Elegibilidad para Bolivia sin confirmar");
  if (
    /(?:cancelad[ao]|suspendid[ao]|convocatoria cerrada|applications (?:are )?closed)/.test(
      text,
    )
  )
    reasons.push("La fuente indica cierre o suspensión");
  return { candidate, reason: reasons.join(". ") };
}
