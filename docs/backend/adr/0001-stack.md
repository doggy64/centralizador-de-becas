# ADR 0001 · Entorno de S0

El kit prescribe versiones compatibles y reproducibles. El workspace fija Node 22.22.2, pnpm 10.32.1, NestJS 11.1.17 y TypeScript 5.9.3. Los manifiestos fijan versiones exactas y pnpm-lock.yaml resuelve dependencias transitivas. Jest y Supertest cubren proceso y HTTP. El validador desreferencia OpenAPI y contrasta los cuerpos JSON con AJV y sus formatos.

PostgreSQL 17 sirve desarrollo y pruebas en instancias separadas. S1 introducirá Prisma con su primera migración revisable. Las dependencias de Crawlee, Cheerio, Zod y PyMuPDF entran con sus consumidores. Playwright requiere una fuente aprobada que precise renderizado. La API y el worker compilan por separado.

## Contrato para revisión

En la copia de trabajo del contrato, NullableModality, NullableCoverage y NullableTemporalStatus incluyen null entre los valores permitidos. NullableEvidence acepta una evidencia completa o el literal null. Los enums de filtro de entrada y la evidencia obligatoria conservan sus restricciones. Los tres JSON del kit se conservan byte por byte. DEV 1 debe validar la generación del cliente, la multiselección queda para un acuerdo separado. El contrato compartido se congela al integrar el bootstrap.
