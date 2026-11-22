# Plan de ejecución

La prioridad es P0 desde BOOT hasta TEC-15, con TEC-08 reservado para P1. Cada fila representa una unidad revisable desde develop. El propietario de Prisma es apps/api; catálogo de fuentes, extracción y edición van en apps/worker; infraestructura y CI en infra y .github. Cerrar cada unidad con pruebas ejecutadas, evidencia y revisión cruzada.

| Fase | ID | Depende de | Entrega y módulo | Prueba de salida | Integración |
|---|---|---|---|---|---|
| S0 | BOOT | 0 | OpenAPI, fixtures, base monorepo, health, docker, CI preliminar | API arranca; contrato valida; DEV1 revisa | DEV1 review |
| S1 | TEC-02 | BOOT | Prisma esquema, migraciones, taxonomías, unicidades | Migración DB test, seed idempotente | Ninguna |
| S1 | TEC-01 | TEC-02 | Fuentes aprobadas, políticas de robots/acceso | URL no aprobada no se rastrea | Ninguna |
| S1 | TEC-03 | TEC-01;TEC-02 | CLI import/dry-run, estados DRAFT, evento de auditoría | Ejecución doble sin duplicar; sin autopublicar | Ninguna |
| S2 | TEC-04 | TEC-02;BOOT | Lista/detalle/filtros, DTO, errores, paginación | 200/400/404 y OpenAPI compatibles; solo PUBLISHED | DEV1 integración API |
| S2 | TEC-05 | TEC-01 | Crawler Crawlee/Cheerio con límites | Fixtures offline, 403/429/timeout controlados | Ninguna |
| S2 | TEC-06 | TEC-01 | PyMuPDF digital, páginas/texto | Fixture PDF, sin texto → revisión | Ninguna |
| S2 | TEC-07 | TEC-03;TEC-05;TEC-06 | Zod, evidence per field, hash, ingestions | Idempotencia; preservar fuente + revisión humana | DEV1 fixtures si cambia DTO |
| S3 | TEC-10 | TEC-02;TEC-04;TEC-07 | Clock, zona, precisión; dedupe edición | OPEN/UPCOMING/CLOSED/TO_CONFIRM probados | DEV1 estados API |
| S3 | TEC-11 | TEC-07;TEC-10 | APPLY/CONTACT, URL/email, verificación | CONTACT y canal inválido no accionables | DEV1 CTA |
| S3 | TEC-09 | TEC-03;TEC-10;TEC-11 | Revisión/validación/publicación/retiro auditados | No publicación sin verificación y revisor | DEV1 datos reales |
| S4 | TEC-12 | TEC-04;TEC-05;TEC-11 | Rate limit, CORS, SSRF, secretos, logs | Host privado/redir privado bloqueado | Ninguna |
| S4 | TEC-13 | TEC-04;TEC-09;TEC-12 | Unit/integration/contract + E2E coordinado | CI + tests con DB aislada | DEV1 test web |
| S4 | TEC-14 | TEC-12;TEC-13 | Deploy/migrations/health/backup restore | Smoke staging; restore verificado | DEV1 entorno web |
| S4 | TEC-15 | TEC-09;TEC-14 | Fuente/ingesta/review/publish/retire/incidentes | Operador sigue pasos documentados | DEV1 validación final |
| P1 | TEC-08 | Todos los P0 | Borrador IA con evidencias y revisión humana | Sin alucinación ni autopublicación | No bloqueante |
