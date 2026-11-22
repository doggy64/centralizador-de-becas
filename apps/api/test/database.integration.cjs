const { randomUUID } = require("node:crypto");
const path = require("node:path");
const request = require("supertest");
const Parser = require("@apidevtools/swagger-parser");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { PrismaClient } = require("@prisma/client");
const { createApp } = require("../dist/app");
const {
  importCandidate,
  review,
  verifyChannel,
} = require("../../worker/dist/editorial");
const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith("_test"))
  throw Error("Se requiere TEST_DATABASE_URL con base dedicada *_test");
process.env.DATABASE_URL = url;
const db = new PrismaClient();
const slug = "test-" + randomUUID();
const sourceUrl = "https://www.oas.org/test-offline";
const target = "https://www.oas.org/apply-test";
const evidence = {
  sourceUrl,
  excerpt: "Fuente de prueba " + target,
  pageNumber: null,
};
const c = {
  institution: { key: slug, name: "Institución QA", websiteUrl: null },
  program: { key: "qa", name: "Programa QA" },
  slug,
  editionKey: "2027",
  title: "Ingeniería " + slug,
  summary: "Caso sintético de integración",
  sourceUrl,
  evidence,
  levels: ["MASTER"],
  areas: ["ingenieria"],
  countries: ["BO"],
  channels: [
    { type: "FORM_URL", purpose: "APPLY", target, evidence },
    { type: "EMAIL", purpose: "CONTACT", target: "info@example.org", evidence },
  ],
  requirements: [{ label: "Documento", required: null, evidence }],
  benefits: [],
};
let app, api, spec;
function conforms(route, body) {
  const ajv = addFormats(new Ajv({ strict: false, allErrors: true }));
  const valid = ajv.compile(
    spec.paths[route].get.responses["200"].content["application/json"].schema,
  );
  if (!valid(body)) throw Error(ajv.errorsText(valid.errors));
}
beforeAll(async () => {
  spec = await Parser.validate(
    path.resolve(__dirname, "../../../contracts/openapi.yaml"),
  );
  app = await createApp();
  await app.init();
  api = request(app.getHttpServer());
});
afterAll(async () => {
  await app?.close();
  await db.$disconnect();
});
test("dry-run, idempotencia, procedencia múltiple, edición, revisión y consumo v1", async () => {
  await importCandidate(db, c, "test", true);
  expect(await db.scholarship.count({ where: { slug } })).toBe(0);
  const [a, b] = await Promise.all([
    importCandidate(db, c, "test"),
    importCandidate(db, c, "test"),
  ]);
  expect(a.id).toBe(b.id);
  await expect(
    db.scholarship.update({
      where: { id: a.id },
      data: { status: "PUBLISHED", lastVerifiedAt: new Date() },
    }),
  ).rejects.toThrow();
  const other = "https://www.chevening.org/test-offline";
  await importCandidate(
    db,
    { ...c, sourceUrl: other, evidence: { ...evidence, sourceUrl: other } },
    "test",
  );
  expect(
    await db.evidence.count({ where: { callId: a.id, field: "summary" } }),
  ).toBe(2);
  await importCandidate(
    db,
    { ...c, editionKey: "2028", slug: slug + "-next" },
    "test",
  );
  await api.get("/api/v1/scholarships/" + slug).expect(404);
  await expect(
    review(db, slug, "publish", "test", "fuente contrastada"),
  ).rejects.toThrow();
  await review(db, slug, "submit", "test", "lista para revisión");
  const channel = await db.channel.findFirstOrThrow({
    where: { callId: a.id, purpose: "APPLY" },
  });
  await verifyChannel(
    db,
    channel.id,
    "editor",
    "Designación exacta comprobada",
    "VERIFIED",
    jest.fn().mockResolvedValue({}),
  );
  await review(
    db,
    slug,
    "publish",
    "editor",
    "Fuente oficial y datos corroborados",
  );
  const route = "/api/v1/scholarships";
  const res = await api
    .get(route)
    .query({
      q: "ingenieria " + slug,
      level: "MASTER",
      country: "BO",
      area: "ingenieria",
      status: "TO_CONFIRM",
      limit: 1,
    })
    .expect(200);
  conforms(route, res.body);
  expect(res.body.meta).toEqual({
    page: 1,
    limit: 1,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
  });
  expect(res.body.data[0].slug).toBe(slug);
  const page2 = await api
    .get(route)
    .query({ q: slug, page: 2, limit: 1 })
    .expect(200);
  expect(page2.body.data).toEqual([]);
  const detail = await api.get(route + "/" + slug).expect(200);
  conforms(route + "/{slug}", detail.body);
  expect(
    detail.body.applicationChannels.find((c) => c.purpose === "APPLY")
      .urlOrEmail,
  ).toBe(target);
  expect(
    detail.body.applicationChannels.find((c) => c.purpose === "CONTACT")
      .urlOrEmail,
  ).toBeNull();
  const catalog = await api.get("/api/v1/catalogs/filters").expect(200);
  conforms("/api/v1/catalogs/filters", catalog.body);
  for (const q of [
    { page: 0 },
    { limit: 49 },
    { level: "BAD" },
    { status: "BAD" },
    { area: ["ingenieria", "ciencias"] },
  ])
    await api.get(route).query(q).expect(400);
  await importCandidate(db, { ...c, summary: "Cambio sustantivo" }, "editor");
  await api.get(route + "/" + slug).expect(404);
  expect(
    await db.reviewEvent.count({ where: { callId: a.id } }),
  ).toBeGreaterThanOrEqual(5);
}, 30000);

test("plazos corroborados, rechazo, retiro y revocación de fuente", async () => {
  const s = slug + "-dated";
  const dates = {
    startDate: "2026-01-01",
    deadlineDay: "2026-02-01",
    originalDeadlineText: "1 febrero 2026",
    timeZone: "America/La_Paz",
  };
  const record = { ...c, slug: s, editionKey: "dated", ...dates };
  await importCandidate(db, record, "test");
  await review(db, s, "submit", "editor", "comprobar fechas");
  await expect(
    review(db, s, "publish", "editor", "faltan evidencias"),
  ).rejects.toThrow("evidencia");
  await review(db, s, "reject", "editor", "faltan evidencias");
  await importCandidate(
    db,
    {
      ...record,
      fieldEvidence: {
        startDate: evidence,
        deadlineDay: evidence,
        timeZone: evidence,
      },
    },
    "test",
  );
  await review(db, s, "submit", "editor", "corregida");
  await review(db, s, "publish", "editor", "confirmadas");
  const { body } = await api.get("/api/v1/scholarships/" + s).expect(200);
  expect(body.temporalStatus).toBe("CLOSED");
  expect(body.dates.deadline).toBeNull();
  expect(body.applicationChannels.every((x) => x.urlOrEmail === null)).toBe(
    true,
  );
  await review(db, s, "retire", "editor", "archivo");
  await api.get("/api/v1/scholarships/" + s).expect(404);
});
test("normalización y auditoría de ingesta con adaptador offline", async () => {
  const { ingest } = require("../../worker/dist/extract");
  const host = slug + ".example.org",
    url = "https://" + host + "/call";
  const identity = {
    institution: c.institution,
    program: c.program,
    editionKey: "crawl",
    slug: slug + "-crawl",
  };
  await db.source.create({
    data: {
      host,
      officialUrl: url,
      title: "Test",
      policyNote: "Prueba offline",
      approved: true,
      crawlAllowed: true,
    },
  });
  const get = async () => ({
    url,
    mime: "text/html",
    body: Buffer.from(
      "<main><h1>Programa</h1><p>Texto oficial de prueba</p></main>",
    ),
  });
  await ingest(db, url, identity, "test", get);
  await ingest(db, url, identity, "test", get);
  const call = await db.scholarship.findUniqueOrThrow({
    where: { slug: identity.slug },
  });
  expect(call.status).toBe("DRAFT");
  expect(await db.evidence.count({ where: { callId: call.id } })).toBe(1);
  await expect(
    ingest(db, url, identity, "test", async () => {
      throw Error("timeout");
    }),
  ).rejects.toThrow("timeout");
  expect(
    await db.ingestionRun.count({ where: { host, status: "FAILED" } }),
  ).toBe(1);
  await review(db, identity.slug, "submit", "test", "lista");
  await review(db, identity.slug, "publish", "test", "confirmada");
  await db.source.update({ where: { host }, data: { approved: false } });
  await api.get("/api/v1/scholarships/" + identity.slug).expect(404);
});
test("correo de postulación requiere designación literal y pierde vigencia", async () => {
  const s = slug + "-email",
    target = "becas@example.org";
  const item = {
    type: "EMAIL",
    purpose: "APPLY",
    target,
    evidence: { ...evidence, excerpt: "Postule por correo a " + target },
  };
  const invalid = {
    ...item,
    target: "otro@example.org",
    evidence: { ...evidence, excerpt: "otro@example.org.invalid" },
  };
  const { id } = await importCandidate(
    db,
    { ...c, slug: s, editionKey: "email", channels: [item, invalid] },
    "test",
  );
  await review(db, s, "submit", "test", "lista");
  const channels = await db.channel.findMany({ where: { callId: id } });
  const good = channels.find((x) => x.target === target);
  await expect(
    verifyChannel(
      db,
      channels.find((x) => x.target !== target).id,
      "editor",
      "revisado",
      "VERIFIED",
    ),
  ).rejects.toThrow("exacta");
  await verifyChannel(
    db,
    good.id,
    "editor",
    "correo indicado por la fuente",
    "VERIFIED",
  );
  await review(db, s, "publish", "editor", "confirmada");
  const route = "/api/v1/scholarships/" + s;
  const result = await api.get(route).expect(200);
  expect(result.body.applicationChannels.map((x) => x.urlOrEmail)).toContain(
    target,
  );
  await db.channel.update({
    where: { id: good.id },
    data: { verifiedAt: new Date("2000-01-01") },
  });
  const stale = await api.get(route).expect(200);
  expect(
    stale.body.applicationChannels.find((x) => x.verificationStatus === "STALE")
      .urlOrEmail,
  ).toBeNull();
});
