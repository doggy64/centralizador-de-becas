# PLAN DE DESARROLLO — DEV 2
## Backend, base de datos, OSINT, scraping, publicación y operación del MVP de becas

**Estado:** plan operativo para ejecución por un agente de programación.  
**Proyecto:** Centralizador de becas para estudiantes de Bolivia, extensible a oportunidades internacionales.  
**Propietario de código:** DEV 2. **Contraparte:** DEV 1, propietario exclusivo del frontend.  
**Referencia funcional:** `Product_Backlog_MVP_Estudiantes_Becas.xlsx`, plan maestro y `00_PLAN_PARALELO.md`.  
**Contrato canónico de trabajo paralelo:** `contracts/openapi.yaml` (copia incluida con este plan).  
**Alcance:** TEC-01–TEC-07 y TEC-09–TEC-15 son P0; TEC-08 es P1 opcional. Trabajar en S0, S1, S2, S3 y S4.

---

## 1. Misión y resultado esperado

Construir la **fuente única de verdad** de las convocatorias, que permita al frontend mostrar oportunidades de becas fiables y verificadas. DEV 2 debe entregar:

1. API REST pública **solo lectura** para listado, búsqueda, filtros, detalle y salud.
2. Base de datos PostgreSQL con programas, ediciones, fuentes, evidencias, requisitos, documentos, beneficios y vías de postulación.
3. Ingestión responsable de fuentes públicas mediante HTML y PDF, con normalización e idempotencia.
4. Revisión editorial interna por CLI: un scraper nunca publica automáticamente.
5. Reglas confiables para vigencia, filtrado, deduplicación, verificación de canales oficiales y procedencia.
6. Tests unitarios, integración, contrato, seguridad, CI, despliegue, respaldo y guía operativa.

**La experiencia del estudiante se implementa exclusivamente por DEV 1.** DEV 2 no crea, corrige ni refactoriza pantallas o componentes de `apps/web/`.

### Condición funcional de salida

La aplicación integrada permitirá que un estudiante, sin registrarse, busque una beca, la filtre, lea su ficha con fuente y fecha de verificación, y acceda a un **formulario o correo de postulación respaldado por la institución**. Si la postulación no está verificada, el backend no expone un destino accionable.

### Fuera de alcance P0

Login de estudiantes, perfiles, favoritos, alertas, recomendaciones, panel administrativo web, chatbot, aplicación dentro de la plataforma, scraping de sitios autenticados, evasión de CAPTCHAs, sistemas de colas Redis/BullMQ, Playwright para extracción dinámica como requisito, búsqueda vectorial e IA obligatoria. Si hay tiempo posterior, `TEC-08` puede introducir IA asistida **solo para borradores con evidencia y revisión humana**.

---

## 2. Límites de propiedad: nunca tocar archivos de DEV 1

| Ruta | Propietario | Regla |
|---|---|---|
| `apps/api/**` | DEV 2 | NestJS, prisma, tests de backend |
| `apps/worker/**` | DEV 2 | Crawlers, extractores PDF, CLI editorial, tests |
| `contracts/**` | DEV 2 | ÚNICA fuente versionada de OpenAPI y fixtures; cambios revisados por DEV 1 |
| `packages/shared/**` | DEV 2 | Solo utilidades realmente compartibles; no introducir lógica web |
| `infra/**`, `.github/**` | DEV 2 | Docker, CI, deploy, backups y políticas de seguridad |
| `docs/backend/**`, `docs/operaciones/**`, `docs/integracion/**` | DEV 2 | Decisiones, runbooks y evidencia de integración |
| `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `AGENTS.md`, `.env.example` y otros archivos raíz | DEV 2 | Cambios globales requieren revisión cruzada |
| `apps/web/**`, `docs/frontend/**` | **DEV 1** | **PROHIBIDO editar**, incluso para arreglar un test E2E |

**No dupliques** el contrato en `packages/contracts/`; la ruta canónica es `contracts/`. El frontend puede generar su cliente **dentro de `apps/web/`**, pero solo DEV 1 cambia esos archivos.

### Protocolo de dependencias con DEV 1

- DEV 2 proporciona OpenAPI + fixtures **antes** de implementar endpoints que Dev 1 consumirá.
- DEV 1 puede desarrollar contra mocks; nunca necesita esperar a que acabe el scraper.
- Cualquier cambio de campo, enum, query param o nulabilidad se propone en un **PR de contrato aislado**. DEV 1 lo revisa. Primero se integra contrato/backend compatible; después Dev 1 ajusta su cliente.
- No hacer cambios destructivos sin plan de transición. Nunca editar archivos ajenos para hacer que pase una integración.
- Los E2E de Dev 1 se ejecutan y diagnostican por Dev 2, pero sus correcciones de interfaz se solicitan a Dev 1.

---

## 3. Tecnología y decisiones explícitas

| Responsabilidad | Stack elegido | Razón |
|---|---|---|
| Monorepo | `pnpm` workspaces + TypeScript estricto | Una instalación y contratos tipados |
| API | NestJS REST + Swagger/OpenAPI | Módulos claros, validación y documentación |
| Persistencia | PostgreSQL + Prisma Migrate | Integridad relacional y migraciones |
| Extracción HTML | Crawlee + Cheerio | Recorrer sitios permitidos con límites |
| Extracción PDF | PyMuPDF invocado desde CLI controlada | PDF digital con texto; OCR no obligatorio |
| Validación de candidatos | Zod | Contrato consistente entre importación y persistencia |
| Tests API | Jest + Supertest | Unidad e integración HTTP |
| Tests worker | Jest + fixtures HTML/PDF offline | Reproducibilidad sin acceso a sitios externos |
| Infra | Docker Compose + GitHub Actions | Entorno controlado, migración y CI |
| Búsqueda | PostgreSQL con búsquedas parametrizadas; `unaccent`/`pg_trgm` si hace falta | Sin infraestructura extra para el piloto |

**No fijar versiones inventadas.** Antes del bootstrap consultar versiones estables y compatibilidad real entre Node.js, NestJS, Prisma y Crawlee; fijarlas en manifest/lockfile y documentarlas en una ADR.

### Estructura recomendada

```text
becas-mvp/
├── apps/
│   ├── web/                           # NO TOCAR: DEV 1
│   ├── api/                           # DEV 2
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/{errors,filters,pipes,guards}/
│   │   │   ├── modules/
│   │   │   │   ├── scholarships/{controllers,services,domain,dto,repositories}/
│   │   │   │   ├── institutions/
│   │   │   │   ├── catalogs/
│   │   │   │   ├── sources/
│   │   │   │   └── health/
│   │   │   └── prisma/
│   │   ├── prisma/{schema.prisma,migrations,seed.ts}
│   │   └── test/{integration,contract}/
│   └── worker/                        # DEV 2
│       ├── src/
│       │   ├── sources/{registry,source-configs}/
│       │   ├── extractors/{html,pdf}/
│       │   ├── pipeline/{fetch,parse,normalize,validate,deduplicate}/
│       │   ├── editorial/{drafts,review,publish,retire}/
│       │   ├── commands/
│       │   └── security/
│       ├── scripts/extract_pdf.py
│       └── test/fixtures/
├── contracts/{openapi.yaml,fixtures/}  # Única especificación API
├── packages/shared/                   # Si aporta valor real
├── infra/{docker,deploy,backups}/
├── docs/{backend,operaciones,integracion}/
├── .github/workflows/
└── pnpm-lock.yaml
```

**Regla de dependencia:** `controller → caso de uso/servicio de dominio → puerto de repositorio → adaptador Prisma`. El worker usa sus adaptadores propios y el esquema/persistencia compartida de dominio mediante interfaces; no importar controladores HTTP en el worker. No implementar microservicios ni una capa de abstracción vacía por cada tabla.

---

## 4. Modelo de dominio y restricciones de integridad

| Entidad | Contenido esencial | Invariante |
|---|---|---|
| `Institution` | nombre, país, web, dominios oficiales opcionales | Institución puede avalar portales externos |
| `ScholarshipProgram` | institución, nombre, slug, descripción | Un programa tiene muchas ediciones |
| `ScholarshipCall` | programa, `editionKey`, slug, resumen, estado editorial, `lastVerifiedAt` | `unique(programId, editionKey)`; slug único |
| `ScholarshipDates` | inicio, fecha límite con precisión, texto original, zona horaria | Nunca inventar hora ni huso horario |
| `AcademicLevel`, `StudyArea` | taxonomías configurables | FK + tablas puente; sin duplicados |
| `DestinationCountry` | ISO 3166-1 alpha-2 de destino | No confundir país de institución con destino |
| `ScholarshipTerms` | modalidad, cobertura, restricciones | `UNKNOWN` ≠ falso ni cobertura total |
| `Requirement`, `RequiredDocument` | texto, requerido?, orden, evidencia | Null permitido si no confirmado |
| `Benefit` | descripción, monto?, moneda?, evidencia | Beneficios solo si corroborados |
| `ApplicationChannel` | URL/email, `APPLY/CONTACT`, estado de verificación, evidencia | Solo `APPLY+VERIFIED` es accionable |
| `Source` | URL, institución?, tipo, política de acceso, revisión | Registro persistente de procedencia |
| `Evidence` | campo, fuente URL, extracto/página, captura, revisor | Evidencia para información crítica |
| `IngestionRun` | fuente, resultado, hash, fechas, error | Auditabilidad e idempotencia |
| `ReviewEvent` | candidato, operación, responsable, motivo, fecha | Toda transición registrada |

**Enums:**

```text
PublicationStatus: DRAFT | IN_REVIEW | PUBLISHED | REJECTED | RETIRED
TemporalStatus:    OPEN | UPCOMING | CLOSED | TO_CONFIRM  (DERIVADO)
Modality:          ON_SITE | ONLINE | HYBRID | UNKNOWN
Coverage:          FULL | PARTIAL | UNKNOWN
ChannelType:       FORM_URL | PORTAL_URL | EMAIL
ChannelPurpose:    APPLY | CONTACT
Verification:      PENDING | VERIFIED | INVALID | STALE
DatePrecision:     DATE_ONLY | DATETIME | UNKNOWN
```

Migraciones **solo DEV 2**, acumulativas y no destructivas cuando exista producción. Crear índices para `publicationStatus`, `slug`, `programId+editionKey`, filtros y campos de búsqueda, justificando índices según consultas. Evitar borrados en cascada de fuentes/evidencias y jamás borrar historial editorial para ocultar errores.

### Precisión temporal crítica

El contrato de API existente contempla `dates.deadline` con fecha/hora solo si están **verificadas**; para plazos publicados como día calendario únicamente, `deadline` puede ser `null`, mientras `originalDeadlineText` y `precision=DATE_ONLY` preservan la información. **Internamente** guardar un `deadlineDate` (día de calendario) aparte de `deadlineAt` (instante), con zona territorial cuando sea conocida. `computeTemporalStatus` debe manejar ambos casos sin inferir `23:59 UTC`. Si falta zona y afecta al cálculo, responder `TO_CONFIRM`.

### Fecha de verificación vs fecha de descarga

`lastFetchedAt` = última extracción técnica; `lastVerifiedAt` = última revisión/confirmación editorial. Nunca sustituir el segundo por el primero automáticamente.

---

## 5. Contrato HTTP inmutable para la primera integración

**Referencia obligatoria:** `contracts/openapi.yaml` y `contracts/fixtures/*.json` del kit. Implementar los siguientes endpoints exactamente:

| Verbo | Ruta | Respuesta |
|---|---|---|
| GET | `/health` | `{ "status": "ok" }` |
| GET | `/api/v1/scholarships` | `{ data, meta, filters }` |
| GET | `/api/v1/scholarships/{slug}` | `ScholarshipDetail` |
| GET | `/api/v1/catalogs/filters` | catálogos `levels,areas,countries,modalities,coverages,statuses` |

**No hay endpoints públicos POST/PUT/DELETE de importación o publicación.** Usar comandos internos restringidos y auditados.

### Filtros del endpoint listado

```http
GET /api/v1/scholarships
  ?q=ingenieria
  &level=MASTER
  &area=computacion
  &country=ES
  &modality=ONLINE
  &coverage=FULL
  &status=OPEN
  &page=1
  &limit=12
```

- `q`: máximo 120 caracteres, búsqueda sin sensibilidad a tildes/mayúsculas.
- `country`: país de **destino** ISO alpha-2.
- `modality`: `ON_SITE|ONLINE|HYBRID|UNKNOWN`.
- `coverage`: `FULL|PARTIAL|UNKNOWN`.
- `status`: `OPEN|UPCOMING|CLOSED|TO_CONFIRM` (derivado; no guardarlo como verdad permanente).
- `page`: entero >=1. `limit`: entero entre 1 y 48 (12 por defecto).
- `level` y `area`: valores válidos definidos por catálogos; argumentos inválidos → 400.
- Combinación **AND entre categorías**. Contrato v1 actual: **un valor por categoría**; si Dev 1 exige multiselección OR dentro de una categoría, abrir primero PR de contrato acordando sintaxis (`area` repetible u otra), no introducirlo de forma unilateral.
- Todas las consultas incluyen `publicationStatus=PUBLISHED`. Slug oculto/inexistente → 404.
- Lista vacía → `data:[]`, `meta.total:0`, no un 404.
- Paginación determinista con orden estable y desempate por `id` o `slug`.
- Respuestas 400/404/500: `{error:{code,message,requestId?}}`; no filtrar SQL, stack traces ni tokens.

### Campos públicos fundamentales

En la tarjeta: ID, slug, título, resumen, nombre del programa, edición, institución, niveles, áreas, países destino, modalidad, cobertura, `temporalStatus`, fechas, `lastVerifiedAt`.

En detalle, adicionalmente: requisitos, documentos, beneficios, `applicationChannels`, `sourceOriginalUrl`, `sourceTitle`. Los campos no confirmados son nulos, no inventados. En canales, `urlOrEmail` **solo se expone si** `purpose=APPLY` **y** `verificationStatus=VERIFIED`; para `CONTACT`, `STALE`, `INVALID` o `PENDING` es `null`.

### Pruebas de contrato

- Validar OpenAPI estático y fixtures contra el esquema.
- Validar respuestas reales en integración contra OpenAPI.
- Usar semántica exacta de `nullable`, enums y tipos; no cambiar nombres por preferencia propia.
- Cualquier cambio compatible debe publicarse en PR propio de DEV 2, avisar a Dev 1 y documentar ejemplo actualizado.

---

## 6. Reglas de negocio obligatorias

**RN-01 — Acceso sin login.** Listar y consultar no requiere cuenta. No almacenar perfiles ni documentos de estudiantes.

**RN-02 — Publicación supervisada.** Una ingesta crea `DRAFT`; `PUBLISHED` solo después de revisión humana por CLI interna, con operador y evento de auditoría. Cambios sustantivos después de publicar fuerzan nueva revisión o invalidación de los campos afectados.

**RN-03 — Procedencia oficial.** Se necesita URL de convocatoria o evidencia institucional verificable. Cada fecha/requisito/cobertura/canal debe tener evidencia propia, o tratarse como dato pendiente.

**RN-04 — No inventar elegibilidad.** Sin documento corroborado no presumir notas mínimas, nacionalidades, edades, idiomas ni documentos.

**RN-05 — Postulación verificada.** Contacto institucional `CONTACT` no significa `APPLY`; formulario externo solo válido si una fuente oficial lo enlaza o valida explícitamente. Sin `APPLY+VERIFIED`, el frontend no recibirá enlace accionable.

**RN-06 — Estados de tiempo derivados.** `CLOSED` si deadline confirmado venció; `UPCOMING` si inicio confirmado futuro; `OPEN` si hay ventana abierta confirmada y verificación fresca; `TO_CONFIRM` ante falta de evidencia, precisión insuficiente, zona temporal incierta o fuente desactualizada. En fechas solo día, comparar en calendario territorial sin inventar hora exacta.

**RN-07 — Duplicación por edición.** Mismo programa + `editionKey` + fuente distinta = una convocatoria con múltiples evidencias. Otro `editionKey` no debe fusionarse. No inferir edición solo del año si un programa abre más de una vez.

**RN-08 — Filtros fiables.** Valores desconocidos no coinciden con filtros específicos; no usar OR entre categorías. `coverage=FULL` solo si está confirmado en fuente, no por deducción a partir de un beneficio parcial.

**RN-09 — Cambios auditados.** Verificación, aprobación, edición, retirada y corrección registran `ReviewEvent`. Un operador puede retirar convocatoria insegura sin borrarla de la auditoría.

**RN-10 — Recolección responsable y segura.** Acceder solo a fuentes públicas permitidas; respetar políticas de uso, robots, límites, tiempo de respuesta, tamaño de archivos; no evadir login/CAPTCHA. Bloquear SSRF, IPs privadas, destinos internos y esquemas no HTTP(S), verificando redirects y resolución DNS.

**RN-11 — Calidad operacional.** Fallos parciales de un crawler no tumban la API; reintentos con backoff, logs sin secretos, no descargar archivos indefinidos, no publicar cambios ambiguos.

---

## 7. Motor de ingestión: pipeline obligatorio

```text
Catálogo de fuentes aprobadas
    ↓
Verificación de política de crawling/host/robots
    ↓
Fetch controlado (HTML/PDF)
    ↓
Extracción (Crawlee+Cheerio / PyMuPDF)
    ↓
Normalización + validación Zod
    ↓
Detección de edición + duplicados + conflicto
    ↓
DRAFT / IN_REVIEW + evidencia por campo
    ↓
Revisión humana por CLI con auditoría
    ↓
PUBLISHED o REJECTED/RETIRED
    ↓
API pública de solo lectura
```

### Fuentes iniciales

Registrar de 3 a 5 portales institucionales **candidatos**, comprobar una por una sus condiciones de extracción y priorizar portales con convocatorias claras. Si scraping no es apropiado o no se permite, usar **importación editorial** desde datos que pueda reutilizarse legalmente; la app no debe depender de automatización en todas las fuentes. La meta piloto son **15 convocatorias reales verificables, si existen**, no un número artificial.

### Interfaces mínimas sugeridas

```ts
export interface SourceAdapter {
  supports(source: SourceConfig): boolean;
  discover(source: SourceConfig): Promise<DiscoveredDocument[]>;
}

export interface DocumentExtractor {
  supports(mediaType: string): boolean;
  extract(document: DocumentRef): Promise<ExtractedDocument>;
}

export interface CandidateNormalizer {
  normalize(document: ExtractedDocument): Promise<ScholarshipCandidate>;
}

export interface DraftRepository {
  upsertDraft(candidate: ScholarshipCandidate, runId: string): Promise<string>;
}
```

- **Strategy** para variantes de fuente/documento, **Adapter** para HTML/PDF, **Registry/Factory** para seleccionar extractor y **Pipeline** para fases de normalización. No introducir una jerarquía abstracta para un único caso.
- Hacer extracción y pruebas contra fixtures offline.
- `contentHash` permite evitar trabajo redundante; no reemplaza revisión humana ni garantiza que la edición sea la misma.
- La normalización conserva datos crudos y la evidencia; jamás sobreescribe silenciosamente una corrección humana.
- La deduplicación debe ser transaccional y resistente a reejecutar varias veces una importación.

### CLI propuesta (nombres operativos, crear y documentar scripts reales)

```bash
pnpm --filter @becas/worker source:list
pnpm --filter @becas/worker source:check --id SOURCE_ID
pnpm --filter @becas/worker ingest --source SOURCE_ID --dry-run
pnpm --filter @becas/worker ingest --source SOURCE_ID
pnpm --filter @becas/worker editorial:list --status DRAFT
pnpm --filter @becas/worker editorial:review --call ID --reviewer OPERADOR
pnpm --filter @becas/worker editorial:publish --call ID --reviewer OPERADOR
pnpm --filter @becas/worker editorial:retire --call ID --reviewer OPERADOR --reason "motivo"
pnpm --filter @becas/worker links:verify --call ID --dry-run
```

Estos comandos son **objetivos que el agente debe implementar**, no afirmaciones de que ya existan. CLI accesible solo a operadores con permisos de entorno, DB y auditoría; `--reviewer` no sustituye controles operativos de acceso. No exponer esta CLI vía API pública.

---

## 8. Secuencia exacta de implementación (PRs pequeños)

Las fases se ejecutan en orden de dependencias. Los IDs `TEC-*` provienen del Product Backlog técnico. Un PR puede combinar subpasos estrechamente relacionados, pero **no mezclar funcionalidades no dependientes**.

### S0 — Bootstrap y contrato compartido (puerta de inicio)

**Responsable:** DEV 2; revisión obligatoria de DEV 1. Rama: `chore/bootstrap-contract`.

**Tareas**

1. Revisar estructura existente y evitar destruir código previo.
2. Configurar workspace `pnpm`, TypeScript estricto, NestJS/worker, lint/format, scripts de build/test.
3. Crear Docker Compose con PostgreSQL local y base de test separada.
4. Incorporar `contracts/openapi.yaml`, sus fixtures y test de contrato.
5. Publicar `.env.example`, variables con explicación y README de arranque.
6. Establecer dependencias permitidas y versionado en una ADR (`docs/backend/adr/0001-stack.md`).
7. Habilitar `/health` y error HTTP común; sin requerir auth para GET públicos.
8. Abrir PR revisado por DEV 1 antes de continuar en paralelo.

**Criterio de salida:** `pnpm install --frozen-lockfile` (cuando exista lockfile), DB local arriba, API/worker compilan, `/health` responde, contrato y fixtures validan. Dev 1 puede trabajar con mocks desde el mismo commit base.

### S1 — Fuentes, datos y carga editorial (TEC-01, 02, 03)

| Orden | ID / rama sugerida | Implementación | Pruebas/aceptación |
|---|---|---|---|
| 1 | `TEC-02` `feat/dev2/s1-TEC-02-schema` | Entidades, enums, FKs, unicidad programa+edición, migraciones y seeds de taxonomías | Migración up desde DB limpia; reinicio no duplica taxonomías; claves y restricciones comprobadas |
| 2 | `TEC-01` `feat/dev2/s1-TEC-01-sources` | Catálogo de fuentes, dominios y política de acceso, evidencia de tipo de fuente | Fuente sin permiso no se rastrea; URLs no aprobadas se rechazan |
| 3 | `TEC-03` `feat/dev2/s1-TEC-03-import-editorial` | Importación CLI con `--dry-run`, `DRAFT`, idempotencia, review event y operador | 2 ejecuciones no duplican convocatoria; dry-run no modifica DB; ningún DRAFT público |

**Entregables S1:** migraciones, fixtures sintéticos solo test, 3–5 fuentes evaluadas, scripts de importación internos, guía `docs/backend/s1.md`. Aún no es obligatorio el crawler completo.

**Gate S1:** API y worker arrancan, DB aislada, evidencia básica, importación reversible o idempotente, ninguna publicación accidental.

### S2 — API pública y extracción HTML/PDF (TEC-04, 05, 06, 07)

| Orden | ID / rama sugerida | Implementación | Pruebas/aceptación |
|---|---|---|---|
| 4 | `TEC-04` `feat/dev2/s2-TEC-04-public-api` | Controllers/DTOs GET lista, detalle, catálogos; filtros, paginación, errores, solo PUBLISHED | 200/400/404/500 contratados; query con tildes; 404 para borrador; `meta` exacta |
| 5 | `TEC-05` `feat/dev2/s2-TEC-05-html-extractor` | Crawlee + Cheerio, extractores por fuentes permitidas, límites y fixtures | HTML paginado, 403/429, timeouts, sin lanzar procesos HTTP |
| 6 | `TEC-06` `feat/dev2/s2-TEC-06-pdf-extractor` | PyMuPDF CLI, PDF texto y páginas; documentar manejo de PDF escaneado | PDF fixture, saltos de página, PDF sin texto→estado para revisión, sin alucinar OCR |
| 7 | `TEC-07` `feat/dev2/s2-TEC-07-normalize-evidence` | Normalizador Zod, evidencia por campo, hash/ingestion run, idempotencia | 2 fuentes→misma edición y múltiples evidencias; candidatos incompletos quedan DRAFT |

**Entregables S2:** API integrable con Dev 1, extractores HTML/PDF reproducibles y modelo de evidencias completo. Publicar fixtures actualizados solo mediante cambios de contrato aprobados.

**Gate S2:** contrato real verificado; los listados no muestran DRAFT/REJECTED/RETIRED; filtros y paginación consistentes; extracción offline testeada.

### S3 — Fiabilidad de fechas, revisión y enlaces (TEC-09, 10, 11)

| Orden | ID / rama sugerida | Implementación | Pruebas/aceptación |
|---|---|---|---|
| 8 | `TEC-10` `feat/dev2/s3-TEC-10-status-dedupe` | `computeTemporalStatus(Clock)`, fechas precisas, fresh check, dedupe por edición | CLOSE/OPEN/UPCOMING/TO_CONFIRM; zonas y fecha sola; nunca mezclar dos ediciones |
| 9 | `TEC-11` `feat/dev2/s3-TEC-11-official-channels` | Verificar APPLY/CONTACT, URL/email, redirecciones, flags INVALID/STALE | No URL accionable sin evidencia; tercero oficial referido desde fuente; SSRF bloqueado |
| 10 | `TEC-09` `feat/dev2/s3-TEC-09-editorial-review` | Finalizar flujo DRAFT→IN_REVIEW→PUBLISHED; auditoría, retiro, re-revisión | Sin fuente/canal crítico corroborado no se publica como verificado; cambios sustantivos invalidan revisión anterior |

**Dependencia lógica:** implementar verificación de fechas/canales antes del gate final de publicación; si el esqueleto de revisión existe desde S1, reforzarlo aquí. Dev 1 requiere campos y fixtures finales para UI de fuente y postulación.

**Gate S3:** cero botones de postulación a enlaces no verificados, fechas desconocidas no aparecen como abiertas, historial de revisión auditable, convocatorias duplicadas por misma edición fusionadas sin perder evidencia.

### S4 — Seguridad, QA, despliegue y operación (TEC-12, 13, 14, 15)

| Orden | ID / rama sugerida | Implementación | Pruebas/aceptación |
|---|---|---|---|
| 11 | `TEC-12` `feat/dev2/s4-TEC-12-security` | Rate limit API, CORS/orígenes, headers, input validation, SSRF, DNS/redirects, secretos/logs | Tests URL privadas y protocolos prohibidos, payload inválido→400, no secretos expuestos |
| 12 | `TEC-13` `feat/dev2/s4-TEC-13-qa-contract` | Jest unit/integration/contract; coordinar E2E de Dev 1 con API real en staging | CI reproduce DB limpia; tests API/worker verdes; web E2E invocado, no editado |
| 13 | `TEC-14` `feat/dev2/s4-TEC-14-deploy-backup` | Docker, migraciones deploy, staging, backups/restauración, healthchecks | Deploy reproducible, backup/restauración comprobados, no reset destructivo de DB |
| 14 | `TEC-15` `feat/dev2/s4-TEC-15-runbook` | Runbooks fuentes, carga, revisión, publicación, monitoreo, retiro, incidente | Operador distinto del autor puede seguir procedimientos end-to-end |

**Gate S4:** 29 historias P0 verificadas en integración con DEV 1; cero defectos críticos abiertos; las fichas publicadas tienen fuente original y `lastVerifiedAt`; canales APPLY públicos son verificados; entorno recuperable desde backup.

### P1 — Solo tras cerrar todos los P0

`TEC-08` extracción con IA asistida: JSON estructurado, evidencia de documento por atributo, razonamiento de incertidumbre expresado en campos y revisión humana. No autopublicar, no añadir vector DB ni motor semántico a MVP.

---

## 9. Lista de entregas visibles a DEV 1

| Momento | Lo que entrega DEV 2 | Lo que hace DEV 1 sin tocar backend |
|---|---|---|
| Fin S0 | OpenAPI estable + `contracts/fixtures` + URL base de API | Cliente tipado, mocks, layout inicial |
| Fin S1 | DB operativa, catálogos y fixtures sin datos ficticios en producción | Inicio y navegación sin login |
| Avance S2 | GET lista, detalle y filtros con datos publicados de prueba controlados | Sustituir mocks, integrar catálogo y ficha |
| Fin S2 | Normalización y primeros datos verificados | Pruebas E2E con backend real |
| Avance S3 | Estados temporales y fechas confiables | Filtros vigencia y avisos |
| Fin S3 | Fuentes verificadas, canales `APPLY+VERIFIED` o nulos | Botón de postular bajo política del contrato |
| Fin S4 | API segura desplegada, CI, backups y runbook | Pruebas finales responsive/E2E del flujo completo |

**Comunicación mínima por PR:** `ID / cambio / endpoints afectos / contrato cambia sí-no / fixtures modificados / pruebas ejecutadas / bloqueo para DEV1 / enlace al PR`. Un cambio que afecte el frontend debe notificarse **antes de mergear**.

---

## 10. Matriz de pruebas obligatoria para DEV 2

| Caso | Nivel | Resultado esperado |
|---|---|---|
| Crear dos veces misma `programId+editionKey` | BD + integración | Una edición, sin duplicados |
| Ingerir misma convocatoria de dos URLs | Worker + BD | Una ficha, evidencias de ambas fuentes |
| Ingerir ediciones distintas de programa | Worker + BD | Dos fichas independientes |
| GET lista con DRAFT y PUBLISHED | API integración | Solo PUBLISHED |
| GET detalle de DRAFT o inexistente | API integración | 404 sin filtración de datos |
| Filtro de país destino + nivel + modalidad | API integración | AND de categorías correcto |
| Búsqueda `ingeniería` y `ingenieria` | API integración | Equivalencia razonable de búsqueda |
| Query `page=0`, `limit=100`, enum inválido | API integración | 400 estructurado |
| Resultado sin coincidencias | API integración | `{ data:[], meta.total:0 }` |
| Fecha vencida confirmada | Dominio | CLOSED |
| Fecha futura de apertura confirmada | Dominio | UPCOMING |
| Inicio/cierre inciertos y freshness vencida | Dominio | TO_CONFIRM |
| Fecha únicamente calendario | Dominio | No inventar hora/UTC |
| `CONTACT` con URL o correo oficial | Contrato/API | `urlOrEmail=null`, no CTA APPLY |
| APPLY sin evidencia o con URL inválida | Dominio/API | PENDING/INVALID y URL no accionable |
| Aplicación externa vinculada oficialmente | Dominio | Puede validarse con evidencia explícita |
| CLI con `--dry-run` | Worker | No escribe cambios persistentes |
| Intento de publicar sin revisión | CLI/BD | Rechazo + registro del intento cuando corresponda |
| Scraper de hostname no permitido/IP privada | Seguridad worker | Bloqueo previo a fetch y tras redirects |
| Respuesta 429/timeout/PDF corrupto | Worker | Fallo controlado, run auditado, sin autopublicar |
| Contratos OpenAPI y fixtures | Contrato | Compatibles con DTOs reales |
| Pruebas E2E de Dev 1 con API real | Integración | Journey completo sin mocks |
| Migración sobre DB nueva y backup→restore | Operación | Esquema operativo y datos recuperables |

**Calidad propuesta:** tests críticos de reglas de dominio con cobertura objetivo ≥90%; CI verde; errores críticos abiertos = 0; medir p95 de API en piloto antes de hacer promesas de rendimiento. No declarar pruebas ejecutadas sin haberlas corrido.

### Comandos mínimos (deben existir después del bootstrap)

```bash
pnpm install --frozen-lockfile
pnpm --filter @becas/api lint
pnpm --filter @becas/api typecheck
pnpm --filter @becas/api test
pnpm --filter @becas/api test:integration
pnpm --filter @becas/api build
pnpm --filter @becas/worker lint
pnpm --filter @becas/worker typecheck
pnpm --filter @becas/worker test
pnpm --filter @becas/worker build
pnpm contracts:validate
```

Los nombres de scripts son **objetivos de configuración**, no evidencia de ejecución. La suite E2E web de Dev 1 se incorpora al gate de integración sin editar `apps/web/**`.

---

## 11. CI/CD, seguridad y operación

### CI obligatorio

1. Instalación con lockfile congelado; scanner de secretos/dependencias según recursos disponibles.
2. Validación de propiedad de rutas por rol y cambios inesperados de `contracts/`.
3. Lint + typecheck + build por paquete.
4. Tests unitarios offline y contract tests.
5. PostgreSQL efímero para pruebas de integración, migraciones desde cero y fixtures sintéticos de test.
6. Smoke test API (`/health`, búsqueda, detalle) contra datos de integración.
7. En release integrado: ejecutar E2E de Dev 1 con API real y revisar fallos con propietario correcto.

### Seguridad en API

- Validar DTOs de query; escapar/parametrizar consultas SQL; limitar longitud, paginación y tasa de peticiones.
- CORS restrictivo según entornos, headers seguros, HTTPS y no exponer stack traces.
- Nunca registrar credenciales ni datos personales. No incluir contenidos sensibles de queries o documentos de estudiantes en logs.
- No añadir endpoints editoriales públicos sin autenticación robusta. Para P0, toda edición es CLI con credenciales del entorno separadas y privilegios mínimos.

### Seguridad en worker

- `robots.txt` y condiciones de sitio evaluados; calendario conservador y límites de concurrencia por dominio.
- Allowlist de hosts/URLs; DNS e IP públicas validadas antes de conectar **y tras redirecciones**; bloquear localhost, RFC1918, link-local, metadata y rangos reservados; evitar DNS rebinding con control de conexión y aislamiento de red.
- Timeouts, límite bytes HTML/PDF, MIME comprobado, profundidad y reintentos con backoff.
- Nunca manejar cookies privadas ni utilizar técnicas para superar restricciones de acceso.
- Validación manual si el enlace de postulación pertenece a un tercero (debe existir evidencia de que la institución lo designó).

### Despliegue y runbook

- Separar `local`, `test`, `staging`, `production` con variables únicas y contraseñas fuera del repositorio.
- Despliegue de API con migraciones `deploy`, healthchecks y logs. Worker independiente y ejecución restringida.
- Backups automáticos y prueba explícita de restauración; un respaldo no es suficiente si nunca se ha restaurado.
- Runbook debe explicar: añadir fuente, revisar permisos, hacer dry-run, ingerir, revisar evidencias, aprobar, publicar, corregir, reevaluar enlace, retirar y gestionar incidente de phishing.

---

## 12. Git y workflow de PR independiente

Las ramas funcionales salen siempre de `develop`; `main` solo recibe versiones estables. No usar una única rama larga de Dev 2; abrir PR pequeños. El protocolo completo está en `referencias/GIT_Y_COORDINACION.md`.

```bash
# Antes de empezar el siguiente TEC:
git fetch origin
git switch develop
git pull --ff-only origin develop
git switch -c feat/dev2/s2-TEC-04-public-api

# Trabajar SOLO en rutas propias.
# Ejecutar lint, typecheck, test, build, contract.

git diff --name-only origin/develop...HEAD
# Comprobar que no aparezcan apps/web/** ni docs/frontend/**.

git add apps/api apps/worker contracts infra docs/backend docs/operaciones docs/integracion
# Añadir también manifest/lockfile o .github solo cuando correspondan y estén revisados.
git commit -m "feat(api): TEC-04 API pública de becas verificadas"
git push -u origin feat/dev2/s2-TEC-04-public-api
# Abrir PR a develop y solicitar revisión de DEV1.
```

**Antes de merge:** contrato compatible, tests correspondientes verdes, migración revisada si cambia DB, evidencia de seguridad, ninguna modificación de DEV 1, PR con alcance del ticket. No forzar push a `main` ni `develop`.

### Plantilla de reporte por PR

```text
ID: TEC-__
Fase: S__
Objetivo del PR:
Archivos propios modificados:
API/contrato cambia: Sí/No
Compatibilidad con DEV 1:
Migración DB: Sí/No
Pruebas ejecutadas (comando → resultado):
Evidencia/fixture:
Riesgos y pendientes:
Siguiente PR recomendado:
```

---

## 13. Decisiones pendientes que NO deben tomarse silenciosamente

1. **Multiselección de filtros:** el OpenAPI v1 disponible define `level`, `area`, etc. como valores únicos. Si el backlog exige multiselección, acordar primero la sintaxis/versionado con Dev 1 y extender contrato/fixtures antes del código.
2. **Definición de fuente oficialmente verificable:** documentar tipos de dominio, enlaces desde portal institucional y formularios externos autorizados.
3. **Zonas horarias por convocatoria:** cuando no haya zona confirmada, no asignar arbitrariamente la zona de Bolivia a becas internacionales.
4. **Frescura de verificación:** definir límites operativos conservadores según tipo de fuente; si vence la frescura, degradar de OPEN confirmado a `TO_CONFIRM` o marcar para revisión según política.
5. **Formato del importador editorial:** fijar CSV/JSON y esquema en S1; siempre preservar campos nulos y evidencia original.
6. **Reutilización de documentos:** antes de almacenar PDF o texto completo, comprobar condiciones de uso; si no está permitido, conservar referencia/fragmento mínimo y enlace.

Registrar decisiones en ADR en `docs/backend/adr/`; cuando incidan en UX/API, abrir un PR de contrato revisado por DEV 1.

---

## 14. Definition of Done para cada TEC

- [ ] ID TEC documentado; cambios dentro del área Dev 2.
- [ ] Código con responsabilidad clara y tipado estricto; no lógica duplicada de tiempo/validación.
- [ ] Migración y datos de prueba separados de datos reales, si aplica.
- [ ] Tests unitarios y/o de integración para casos normales, nulos y errores.
- [ ] API y fixtures cumplen `contracts/openapi.yaml`.
- [ ] Lint, typecheck, tests, build y smoke pertinente ejecutados o bloqueo documentado.
- [ ] No se publica contenido no revisado ni se expone formulario no verificado.
- [ ] Documentación de operación y `docs/backend/progreso.md` actualizada.
- [ ] PR a `develop` revisado por DEV 1, sin archivos `apps/web/**`.

### Checklist de release del servidor

- [ ] 14 habilitadores técnicos P0 (`TEC-01`…`TEC-07`, `TEC-09`…`TEC-15`) completos.
- [ ] Fuentes y becas reales revisadas; jamás usar fixtures ficticios en producción.
- [ ] API solo muestra `PUBLISHED` y responde 400/404 adecuadamente.
- [ ] 100% de las vías APPLY accionables han sido verificadas y auditadas.
- [ ] Fichas públicas con fuente original y `lastVerifiedAt`.
- [ ] Estado de tiempo sin fechas/horas inventadas, dedupe por edición.
- [ ] Scrapers seguros; error externo no interrumpe API.
- [ ] Migraciones en staging, backups y restauración verificados.
- [ ] CI + E2E integrada con DEV 1; 29 historias P0 validadas en conjunto.
- [ ] Documentos runbook, riesgos y pendientes entregados.

---

## 15. Instrucción inicial para pegar al agente DEV 2

> Actúa como ingeniero backend senior y único responsable Dev 2 del MVP Centralizador de Becas. Lee `PLAN_DEV2_BACKEND_DATOS_OSINT_SCRAPING.md`, `AGENTS_DEV2.md`, `contracts/openapi.yaml` y sus fixtures antes de modificar archivos. Revisa el repositorio existente y detecta el estado actual. Tu propiedad exclusiva es `apps/api/**`, `apps/worker/**`, `contracts/**`, `packages/shared/**`, `infra/**`, `.github/**`, root y `docs/backend/**`, `docs/operaciones/**`, `docs/integracion/**`. Está prohibido editar `apps/web/**` y `docs/frontend/**`. Prioriza 14 TEC P0 y ejecuta desde S0 en PRs cortos por ticket contra `develop`. Mantén estable OpenAPI y coordina cambios con Dev 1. Implementa publicación mediante CLI editorial auditada; el scraping crea DRAFT y jamás autopublica. Solo API pública GET y solo PUBLISHED. Enlaces de postulación únicamente APPLY+VERIFIED. Fechas desconocidas TO_CONFIRM. Cada PR debe incluir tests ejecutados, evidencia, migración si aplica, cambios de contrato y riesgos. No agregues IA, microservicios, Redis o panel admin en P0. Comienza por inspeccionar el repositorio y crear una lista de faltantes frente a S0, sin generar código duplicado.

---

## 16. Orden de lectura y artefactos complementarios

1. **Este documento** `PLAN_DEV2_BACKEND_DATOS_OSINT_SCRAPING.md`: plan ejecutable Dev 2.
2. `AGENTS_DEV2.md`: restricciones resumidas y formato de entrega.
3. `DEV2_CHECKLIST.csv`: tabla de PR, dependencias y gates.
4. `contracts/openapi.yaml` y `contracts/fixtures/*.json`: contrato con Dev 1.
5. `referencias/02_INSTRUCCIONES_DEV2_ORIGINAL.md` y `referencias/GIT_Y_COORDINACION.md`: lineamientos acordados.
6. En el repositorio completo, consultar el backlog MVP y plan maestro para verificar cada criterio de aceptación original.

**Importante:** este documento es un plan para ejecutar, no una afirmación de que el código del MVP ya existe o de que las pruebas han pasado.
