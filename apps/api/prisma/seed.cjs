const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
async function seed() {
  const tables = [
    [
      db.academicLevel,
      { UNDERGRADUATE: "Pregrado", MASTER: "Maestría", DOCTORATE: "Doctorado" },
    ],
    [
      db.studyArea,
      {
        ingenieria: "Ingeniería",
        ciencias: "Ciencias",
        educacion: "Educación",
      },
    ],
    [
      db.country,
      { BO: "Bolivia", ES: "España", GB: "Reino Unido", US: "Estados Unidos" },
    ],
  ];
  for (const [table, labels] of tables)
    for (const [value, label] of Object.entries(labels))
      await table.upsert({
        where: { value },
        update: {},
        create: { value, label },
      });
  for (const [title, officialUrl] of [
    ["Chevening", "https://www.chevening.org/scholarship/bolivia/"],
    [
      "Organización de los Estados Americanos",
      "https://www.oas.org/en/scholarships/Academic_Program_OAS_2026.asp",
    ],
    [
      "University College, Oxford",
      "https://univ.ox.ac.uk/wp-content/uploads/2025/09/Web_Studentships-and-Scholarships-2026-27.pdf",
    ], [
      "Erasmus Mundus",
      "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters",
    ],
  ]) {
    const host = new URL(officialUrl).hostname;
    await db.source.upsert({
      where: { host },
      update: {},
      create: {
        host,
        title,
        officialUrl,
        approved: true,
        policyNote:
          "Página institucional contrastada el 2026-11-22. Consulta editorial manual. Permiso de rastreo pendiente.",
      },
    });
  }
}
seed()
  .catch(() => {
    console.error("Falló la carga inicial");
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

