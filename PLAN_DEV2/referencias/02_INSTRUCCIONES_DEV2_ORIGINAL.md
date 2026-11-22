# AGENTE / DESARROLLADOR 2 — BACKEND, BASE DE DATOS, OSINT Y SCRAPING

## Misión
Construir la fuente de verdad del MVP, API REST pública solo de lectura, procesamiento de fuentes oficiales HTML/PDF, normalización, revisión editorial auditada y despliegue. **No editar la interfaz de estudiante en `apps/web/**`.**

## Propiedad
**Puede editar:** `apps/api/**`, `apps/worker/**`, `contracts/**` (única ruta de contratos, raíz), `packages/shared/**`, `infra/**`, `.github/**`, root (incluyendo lockfile), `docs/backend/**`, `docs/operaciones/**`, `docs/integracion/**`. **No editar:** `apps/web/**` ni `docs/frontend/**`.

## Stack y arquitectura
NestJS REST, Prisma + PostgreSQL; importación/esquemas Zod; Crawlee+Cheerio para HTML permitido, PyMuPDF como CLI PDF digital, Jest; Docker Compose y CI. Separar módulos públicos y CLI editorial; sin auth pública en MVP. No introducir Redis, BullMQ, Playwright dinámico, IA o motor vectorial en P0.

## Estructura propia
```
apps/api/src/modules/{scholarships,institutions,catalogs,sources,health}/**
apps/api/prisma/{schema.prisma,migrations/**,seed.ts}
apps/api/test/**
apps/worker/src/{sources,pipeline,commands,http}/**
apps/worker/scripts/extract_pdf.py
contracts/openapi.yaml
contracts/fixtures/**
packages/shared/**
infra/**
docs/backend/**
docs/operaciones/**
.github/workflows/**
```
El contrato se mantiene en `contracts/` en la raíz; no crear una segunda copia en `packages/`.

## Fases

### Preparación previa / contrato primero
- Crear raíz monorepo, workspaces/scripts, dependencias y Docker para Postgres, y publicar `contracts/openapi.yaml` + fixtures con valores consistentes.
- Abrir PR de baseline y recibir aprobación DEV 1 antes del trabajo paralelo. Hacer el cambio que establezca una ruta de contrato única, sin copiar una segunda versión.
- Definir DTOs y errores públicos; contrato de lista, detalle, catálogos y health; fijar nulabilidad. Confirmar que no hay API pública de escritura.

### S1 — `TEC-01`, `TEC-02`, `TEC-03`
- Construir modelo Institution → ScholarshipProgram → ScholarshipCall con una `editionKey` única por programa, fuentes/evidencias, requisitos, documentos, beneficios, aplicación y estados.
- Migraciones y seeds de taxonomías/fixtures sintéticos (nunca producción con datos ficticios).
- Registrar 3–5 fuentes institucionales candidatas; políticas de acceso; si scraping no permitido, carga editorial permitida.
- Crear importador CLI idempotente `--dry-run` que deja candidatos `DRAFT`, flujo mínimo de revisión con operador y evidencias; no exponer credenciales ni endpoints de administración.
- `/health`, API local arrancable y pruebas de integridad + importación. Sin publicaciones automáticas.

### S2 — `TEC-04`, `TEC-05`, `TEC-06`, `TEC-07`
- GET `scholarships`, `scholarships/{slug}`, `catalogs/filters` con filtros parametrizados y páginas `page>=1`, `limit<=48`, solo publicados, `404` para privado/no existe y `400` para query inválida.
- Búsqueda normalizada de acentos, matching de áreas/institución, filtros de modalidad, cobertura, nivel y país de **destino**.
- Crawlee/Cheerio para primeras fuentes HTML; PyMuPDF para PDFs con texto, sin OCR obligatorio; guardar evidencia por campo (URL + página o fragmento).
- Normalizar Zod; duplicados no crean publicaciones paralelas; fixtures HTML/PDF offline y tests CI. No ejecutar crawling en requests HTTP.

### S3 — `TEC-09`, `TEC-10`, `TEC-11`
- `computeTemporalStatus` puro: `OPEN`, `UPCOMING`, `CLOSED`, `TO_CONFIRM`; tiempo IANA y precisión de fecha; sin inventar horas, null desconocido. `Clock` inyectable para pruebas.
- Composición AND entre categorías de filtros y OR dentro de multiselección, filtros combinables; DTO de fechas preciso.
- Deduplicación por `(programId, editionKey)` con edición no supuesta. Migraciones idempotentes.
- Verificador de canal `APPLY` frente `CONTACT`, `VERIFIED` frente `STALE/PENDING/INVALID`; validación de dominio/URL institucional o tercero respaldado por fuente; seguridad redirect/SSRF.
- Workflow editorial con transición DRAFT→IN_REVIEW→PUBLISHED y revisión/auditoría; cambios sustantivos fuerzan re-revisión. No saltar por CLI sin `reviewer`.
- Actualizar fixtures/esquema de DTOs en PR de contrato cuando sea necesario y avisar a DEV 1 **antes** de usar nuevos campos en producción.

### S4 — `TEC-12`, parte servidor de `TEC-13`, `TEC-14`, `TEC-15`
- Rate limits API, configuración segura CORS/headers, validación entradas, salida segura, logs sin PII; red para worker con allowlist, puertos/hosts y IP no privadas, redirects, tamaño/tiempo máximo y backoff.
- Tests unitarios de reglas, integración con DB aislada, contract tests OpenAPI y smoke API. Incorporar suite E2E de DEV 1 en CI sin editar `apps/web`.
- Despliegue reproducible, scripts backup/restore verificados, migración controlada, healthchecks y runbook para revisar, publicar, editar y retirar.
- Objetivo de catálogo piloto: 15 becas reales de fuentes verificables si existen; jamás fabricar datos para llegar a la cifra.

### Opcional P1
`TEC-08` IA asistida únicamente tras cerrar P0; salida estructurada, citas, borradores, revisión humana; no autopublicar.

## Contratos e integración
- `contracts/openapi.yaml` es canónico; mantenerlo equivalente a Swagger/DTOs Nest. El frontend consume el contrato, no importa módulos `apps/api`.
- API pública retorna solo datos `PUBLISHED`; la fecha temporal se calcula en dominio servidor; `TO_CONFIRM` si no hay evidencia suficiente.
- Confirmar `GET` listado retorna `data`, `meta`, `filters`; `GET` detalle retorna ficha con `sourceOriginalUrl`, `lastVerifiedAt`, `applicationChannels` y campos `null` apropiados.
- Cuando cambie un DTO: PR de contrato independiente, compatibilidad hacia atrás, actualizar fixtures y avisar a DEV 1; nunca editar cliente generado en `apps/web`.

## Pruebas mínimas por PR
`pnpm --filter @becas/api lint && pnpm --filter @becas/api typecheck && pnpm --filter @becas/api test`;
`pnpm --filter @becas/worker lint && pnpm --filter @becas/worker typecheck && pnpm --filter @becas/worker test`;
Prisma migrations en PostgreSQL test y pruebas de contrato OpenAPI. Añadir build y run en gate S1–S4. Los comandos definitivos dependen de scripts que tú crees en el bootstrap; no afirmar que se ejecutaron si no es cierto.

## Prompt listo para agente DEV 2
> Actúa exclusivamente como desarrollador backend/ingestión del MVP de becas. Lee `00_PLAN_PARALELO.md`, `02_INSTRUCCIONES_DEV2.md`, `03_GIT_Y_COORDINACION.md`, `contracts/openapi.yaml` y plan maestro. Te pertenecen `apps/api/**`, `apps/worker/**`, los contratos y configuración compartida; está prohibido editar `apps/web/**`. Implementa el siguiente TEC P0 asignado con pruebas y CLI seguras, documenta contratos antes de cambios incompatibles, y abre un PR corto contra `develop`. Nunca publiques automáticamente contenido scrapeado; conserva evidencia, revisión editorial y seguridad de URLs.
