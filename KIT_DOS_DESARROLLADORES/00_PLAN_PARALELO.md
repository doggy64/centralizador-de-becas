# PLAN DE DESARROLLO EN PARALELO — MVP CENTRALIZADOR DE BECAS

**Versión:** 1.0 · **Equipo:** 2 desarrolladores · **Alcance:** 29 historias P0 obligatorias, 3 historias P1 opcionales, 15 habilitadores TEC (TEC-08 opcional).  
**Documento base:** `PLAN_MAESTRO_DESARROLLO_MVP_BECAS.md`; los criterios de aceptación completos siguen vigentes.  
**Principio:** dividir por propiedad de código y contrato, no dividir archivos al azar ni crear dos implementaciones de una misma regla.

## 1. Objetivo y decisiones no negociables

Entregar web pública sin login para buscar becas, filtrar, revisar ficha, fecha/requisitos/fuente, y acceder a canal de postulación oficial **verificado**. Scraping/OSINT alimenta candidatos, que pasan por aprobación editorial interna antes de ser visibles. No se implementan cuentas, alertas, recomendadores, aplicación interna, panel administrativo ni IA de publicación automática. API pública solo GET; únicamente `PUBLISHED`.

Arquitectura: `Next.js (apps/web)` → API REST NestJS (`apps/api`) → Prisma/PostgreSQL. Fuentes oficiales → Crawlee/Cheerio/PyMuPDF (`apps/worker`) → borradores + evidencias → CLI editorial → PostgreSQL. No colas, Redis, microservicios o LLM obligatorio en MVP.

## 2. División estricta y propiedad de directorios

| Área/ruta | Dueño único | Otro desarrollador puede... |
|---|---|---|
| `apps/web/**` (incluye sus E2E, componentes y mocks) | **DEV 1 / Frontend** | Ejecutar y revisar; **no editar** |
| `docs/frontend/**` | **DEV 1** | Leer y comentar |
| `apps/api/**` (incluye `prisma/schema.prisma`, migraciones y seeds) | **DEV 2 / Backend** | Consumir endpoints, revisar PR; **no editar** |
| `apps/worker/**` (OSINT, scraping, PDF, CLI editorial) | **DEV 2** | Ejecutar comandos; no editar |
| `packages/shared/**` y `packages/contracts/**` | **DEV 2** | Leer, generar cliente **solo dentro de `apps/web`**, solicitar cambios por issue |
| `infra/**`, `.github/**` | **DEV 2** | Ejecutar; solicitar cambios por PR/issue |
| `docs/backend/**`, `docs/operaciones/**` | **DEV 2** | Leer |
| `pnpm-lock.yaml`, archivos raíz de workspace, `README.md`, `AGENTS.md`, `.env.example` | **DEV 2** | Solicitar ajustes; no editar directamente |
| `docs/integracion/**` | **DEV 2 consolida** | DEV 1 aporta en PR y `docs/frontend/` |

Si el repositorio existente ya usa `apps/api/prisma/`, conservar esa ruta. No crear un segundo esquema Prisma por accidente. Los archivos de este kit no reemplazan automáticamente los originales: tras revisar se incorporan como documentación de coordinación.

**Balance realista:** DEV 1 asume toda la experiencia del estudiante y E2E; DEV 2 asume el stack servidor, ingestión y editorial. El backend concentra más complejidad técnica; no se debe trasladar archivos compartidos a DEV 1 solo para igualar número de tickets. Si una fase backend demora, DEV 1 progresa con mocks conformes al contrato.

## 3. Preparación conjunta una sola vez (P0 / "contrato primero")

**Responsable de commit: DEV 2.** Ambos acuerdan el contrato; DEV 2 implementa el PR `chore/bootstrap-contract` y DEV 1 lo revisa antes de abrir ramas funcionales.

1. Crear/confirmar estructura monorepo, nombres de paquetes `@becas/web`, `@becas/api`, `@becas/worker`, Node LTS compatible, pnpm lockfile; scripts de lint, typecheck, test y build por workspace.
2. Levantar PostgreSQL local con Docker; configurar variables `DATABASE_URL`, `NEXT_PUBLIC_API_BASE_URL`, además de `.env.example` sin secretos.
3. Acordar **contrato HTTP v1** del archivo `contracts/openapi.yaml`, y fixtures JSON sin datos personales ni becas reales inventadas.
4. Acordar catálogos/valores, temporalStatus (`OPEN`, `UPCOMING`, `CLOSED`, `TO_CONFIRM`), estados editoriales (`DRAFT`, `IN_REVIEW`, `PUBLISHED`, `REJECTED`, `RETIRED`), nulabilidad y errores.
5. Habilitar `main` y `develop` protegidas, PR + CI, propietarios; acordar quién aprueba e integra (un desarrollador revisa el PR del otro).
6. Merge a `develop` y crear tag `contract-v1-baseline` (o anotar SHA); desde ese commit nacen ramas paralelas.

**Gate P0:** `pnpm install --frozen-lockfile` y scripts básicos funcionan; `contracts/openapi.yaml` válido; ambos pueden levantar el workspace; contrato aprobado. Si falta esto, no empezar implementaciones divergentes de endpoint.

## 4. Plan de trabajo en cuatro ciclos paralelos

Son fases técnicas, **no semanas ni plazos**. Cada DEV puede terminar su bloque de fase antes que el otro y continuar con tareas que no dependan de integración.

### Ciclo S1 — Fundamentos y primer recorrido
**DEV 1 (web):** `MVP-001` acceso sin registro, `MVP-002` home/buscador y navegación, componentes y layout, clientes tipados de API y mocks basados en fixtures. Rutas `/`, `/becas`, `/becas/[slug]` con esqueletos, estados y diseño base. Tests unitarios de navegación.  
**DEV 2 (datos):** `TEC-01` fuentes autorizadas, `TEC-02` entidades y migración única, `TEC-03` importador/revisión por CLI; API Nest arranca con `/health`; seed de catálogos y fixtures de test. No exponer borradores.  
**Integración:** web y API levantan desde el mismo `develop`; catálogo de ejemplo de datos *sintéticos* solo en test; borradores no son públicos.  
**Gate:** no auth, importación idempotente, trazabilidad inicial, tests mínimos y contrato no alterado.

### Ciclo S2 — Catálogo y extracción inicial
**DEV 1 (web):** `MVP-003`, `004`, `006`, `007`–`011`, `015` y la primera versión de `032`: listados, búsqueda, filtros individuales, paginación, ficha y estados de carga/error, URLs con query params. UI contra mock hasta que el servidor esté listo.  
**DEV 2 (datos):** `TEC-04` endpoints GET, query y filtros, DTOs publicados/validación/paginación, `TEC-05` scraping HTML permitido, `TEC-06` PDF digitales, `TEC-07` normalización+evidencias. Tests integración para búsqueda por acentos, 400, 404, borradores ocultos y fixtures offline.  
**Integración:** respuesta real satisface schema de `contracts/openapi.yaml`; quitar mock en el build integrado; gate E2E home → lista → ficha sin login.

### Ciclo S3 — Información verificada y postulación segura
**DEV 1 (web):** `MVP-005`, `012`, `013`, `016`–`027`: ver fechas/estados, combinar/limpiar filtros, estado vacío, requisitos, documentos, cobertura, fuente oficial y revisión, programa vs edición, dudas y caducidad; botón de postular solo con canal APPLY verificado.  
**DEV 2 (datos):** `TEC-09` flujo editorial con aprobación humana, `TEC-10` plazos derivados + deduplicación por edición, `TEC-11` verificación de links. Ampliar DTOs, no romper contrato; reglas de tiempo con reloj inyectable; pruebas de unknown→`TO_CONFIRM`, CONTACT≠APPLY, SSL/redirect, fuentes y evidencias; no publicar automáticamente.  
**Orden lógico:** fechas confirmadas → vigencia → filtro por vigencia → filtros combinados → estado vacío. Programa+edición → deduplicación. Fuente/evidencias → canal verificado → CTA.  
**Integración:** E2E completo buscar → filtrar → abrir ficha → fuente → postular/ver aviso. No CTA si canal no está verificado.

### Ciclo S4 — Calidad y release
**DEV 1 (web):** `MVP-029`, `030`, consolidación de `032`; E2E Playwright sobre viewport 360px y desktop, teclado, contraste, redirección externa, 404/empty/error, SEO y controles de UX.  
**DEV 2 (servidor/ops):** `TEC-12` seguridad, `TEC-13` unit/integration server + coordinación de suites E2E, `TEC-14` despliegue, migraciones/backup/restore, `TEC-15` runbook de ingestión, revisión, publicación y retiro.  
**Integración:** smoke tests reales en staging y producción; 29 P0 con aceptación registrada; 0 errores críticos, 100% de canales APPLY visibles verificados. Catálogo piloto objetivo >=15 convocatorias de 3–5 fuentes reales si hay disponibilidad verificable (nunca inventarlas).  
**P1 solo si sobran recursos:** `MVP-014` ordenar, `MVP-028` reportar error, `MVP-031` compartir y `TEC-08` IA asistida, respetando su propiedad de directorio.

## 5. Dependencias explícitas para no bloquearse

| Evento | DEV 1 puede continuar con | DEV 2 debe entregar antes de integrar |
|---|---|---|
| API aún sin listado | Tarjetas y filtros con fixtures del contrato | GET de lista + metadatos + filtro |
| API aún sin ficha | Diseño de detalle con fixture | GET por slug con nulos explícitos |
| Faltan datos reales | Estado vacío y ejemplos sintéticos solo en test | Importación de datos revisados, sin publicarlos automáticamente |
| Estado temporal no implementado | UI de badges con enum pactado | Función de dominio verificable y status real |
| Canal oficial en verificación | CTA **deshabilitado** y aviso | Entregar verified channel de tipo APPLY o null |
| Cambio de contrato | Mantener cliente de versión anterior, crear issue | PR de contrato, schema/fixtures y migración; después DEV 1 ajusta web |

**Nunca** hacer dependencias circulares: API no importa componentes de web, worker no importa routes web, web no importa Prisma ni worker. Ningún archivo fuente es editado por ambos.

## 6. Mecanismo de integración y cambios en contratos

1. API pública usa solo `GET /api/v1/scholarships`, `GET /api/v1/scholarships/{slug}`, `GET /api/v1/catalogs/filters`, `GET /health`.
2. `contracts/openapi.yaml` es la especificación canónica al comenzar. Los DTOs Nest deben implementarla; generar clientes de consumo dentro de `apps/web`. No duplicar reglas de fecha y elegibilidad en web.
3. Cambios compatibles opcionales: DEV 2 modifica contrato + fixtures en PR independiente; después DEV 1 actualiza cliente/tests desde `develop`. Cambios que rompen se coordinan previamente, requieren plan de transición o `/api/v2` si hay consumidores ya desplegados.
4. Test de contrato CI: backend valida salida real contra schema; frontend valida mocks tipados contra schema. Smoke E2E en integración usa backend real, no mocks.
5. Logs/editorial internos y datos de scraping jamás se exponen públicamente. No exponer ruta de importación o publicación sin auth; para MVP se usan **CLI internas**, no endpoints POST.

## 7. Cómo evitar conflictos Git de verdad

- No hay pushes directos a `main`/`develop`; PR con CI obligatorio y **aprobación cruzada**.
- Ramas cortas basadas en la última `develop`, por ticket: `feat/dev1/s2-MVP-004-search` y `feat/dev2/s2-TEC-04-read-api`. No una rama de todo el proyecto por desarrollador durante meses.
- `main` recibe solo merge de release validado desde `develop` (o PR `release/*`), con tag semántico.
- DEV 1 cambia exclusivamente `apps/web/**` y `docs/frontend/**`; DEV 2 los demás paths asignados. Un PR que toca paths del otro se rechaza y se divide.
- Solo DEV 2 regenera/commitea `pnpm-lock.yaml`, edita workspace/root y crea migraciones Prisma. DEV 1 solicita dependencias nuevas por issue y usa componentes ya instalados mientras tanto.
- Migraciones de base de datos son seriales y versionadas; nunca resetear producción ni modificar migraciones ya aplicadas. Revisar cambios destructivos.
- Para integrar, actualizar la rama con `origin/develop`, ejecutar pruebas propias y de contrato, abrir PR. Si dos PR dependen uno del otro, merge primero el contrato/servidor requerido y luego web, no merges cruzados ni cherry-picks de código compartido.
- En máquina única: usar `git worktree` con directorios distintos; bases/puertos separados. Los comandos exactos están en `03_GIT_Y_COORDINACION.md`.
- Informar bloqueos en el PR/issue, no hacer commits de "arreglo rápido" en el paquete ajeno.

## 8. Definition of Done e integración

**DEV 1:** vistas responsive >=360px, URL de búsqueda estable, accesibilidad en flujos clave, estados empty/error/404, tests UI/E2E contra contrato y sin datos falsos como si fueran reales.  
**DEV 2:** GET solo PUBLISHED, DTOs coherentes, filtros y dates correctos, evidencia y canal verificado, ingestión idempotente y responsable, pruebas dominio/integración, migraciones y runbook.  
**PR:** ID MVP/TEC en título, archivos solo del dueño, test/lint/typecheck/build sin errores, evidencias, riesgos, capturas para UI.  
**Merge a develop:** además ejecutar smoke E2E con API real, revisar no hay cambio de contrato inesperado.  
**Release:** las 29 P0 cumplen sus criterios originales, verificación editorial humana, enlaces reales, seguridad, backup/restore y despliegue completo.

## 9. Qué documentos debe leer cada agente

- Ambos: `PLAN_MAESTRO_DESARROLLO_MVP_BECAS.md`, `Product_Backlog_MVP_Estudiantes_Becas.xlsx`, `00_PLAN_PARALELO.md`, `03_GIT_Y_COORDINACION.md`, `contracts/openapi.yaml`.
- DEV 1: `01_INSTRUCCIONES_DEV1.md` y la matriz en `04_MATRIZ_RESPONSABILIDADES.csv`.
- DEV 2: `02_INSTRUCCIONES_DEV2.md` y la matriz.
- Cada agente mantiene su progreso en documentación de su propiedad. DEV 2 consolida el dashboard de integración después de cada PR; DEV 1 **no edita** `docs/progreso.md` común para evitar conflictos.
