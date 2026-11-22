// Catálogo reproducible para probar el frontend contra HTTP y PostgreSQL.
const { PrismaClient } = require("@prisma/client");
const { importCandidate, review } = require("../dist/editorial");
if (process.env.NODE_ENV === "production")
  throw Error("La demo requiere un entorno de desarrollo");
const url = new URL(process.env.TEST_DATABASE_URL);
if (
  !url.pathname.endsWith("_test") ||
  !["127.0.0.1", "localhost", "db-test"].includes(url.hostname)
)
  throw Error("La demo requiere PostgreSQL local *_test");
process.env.DATABASE_URL = url.href;
const db = new PrismaClient();
async function main() {
  const sourceUrl = "https://example.org/convocatoria-prueba",
    slug = "programa-de-prueba-edicion-2027-1";
  await db.source.upsert({
    where: { host: "example.org" },
    update: {},
    create: {
      host: "example.org",
      officialUrl: sourceUrl,
      title: "Fuente ficticia para tests",
      approved: true,
      policyNote: "Fixture exclusiva de la base local de pruebas",
    },
  });
  const evidence = {
    sourceUrl,
    excerpt: "Registro sintético para integración local",
    pageNumber: null,
  };
  await importCandidate(
    db,
    {
      institution: {
        key: "demo",
        name: "Institución ficticia de pruebas",
        websiteUrl: "https://example.org",
      },
      program: { key: "demo", name: "Programa sintético" },
      slug,
      editionKey: "2027-1",
      title: "Convocatoria sintética de prueba",
      summary: "Registro inventado únicamente para pruebas automatizadas.",
      sourceUrl,
      evidence,
      levels: ["MASTER"],
      areas: ["ingenieria"],
      countries: ["BO"],
      modality: "ONLINE",
      fieldEvidence: { modality: evidence },
    },
    "fixture-local",
  );
  const call = await db.scholarship.findUniqueOrThrow({ where: { slug } });
  if (call.status === "DRAFT")
    await review(
      db,
      slug,
      "submit",
      "fixture-local",
      "Simulación editorial local",
    );
  if (call.status !== "PUBLISHED")
    await review(
      db,
      slug,
      "publish",
      "fixture-local",
      "Simulación editorial local",
    );
  console.log("Demo lista: /api/v1/scholarships/" + slug);
}
main()
  .catch(() => {
    console.error(
      "Falló la preparación de demo. Compruebe migración y catálogos.",
    );
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
