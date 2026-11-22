# AGENTS.md — CONTRATO PARA DOS AGENTES DE DESARROLLO

Este repositorio se implementa por **dos propietarios de código**. Antes de cada trabajo leer `00_PLAN_PARALELO.md`, `03_GIT_Y_COORDINACION.md` y el documento de tu rol; la especificación original de historias sigue siendo `PLAN_MAESTRO_DESARROLLO_MVP_BECAS.md`.

## Asignación estricta

- **Agente DEV 1 — Frontend**: solo `apps/web/**` y `docs/frontend/**`. Lee `01_INSTRUCCIONES_DEV1.md`.
- **Agente DEV 2 — Backend, datos y scraping**: `apps/api/**`, `apps/worker/**`, `packages/**`, `contracts/**`, `infra/**`, `.github/**`, configuración raíz y `docs/backend/**`, `docs/operaciones/**`, `docs/integracion/**`. Lee `02_INSTRUCCIONES_DEV2.md`.
- **Prohibición:** no modifiques archivos del otro propietario. Si necesitas una interfaz/campo, crea una solicitud de contrato y sigue con mocks o pruebas de tu módulo.

## Reglas de entrega

1. Rama corta desde `develop`: `feat/dev1/...` o `feat/dev2/...`, nunca push directo a ramas protegidas.
2. PR pequeño, referenciado a un ID `MVP-*` o `TEC-*`, editando solo archivos del dueño.
3. Tests relevantes + lint + typecheck + build y evidencia. Registro en progreso propio.
4. Un contrato OpenAPI v1 versionado gobierna las llamadas; API no importa componentes web y web no importa Prisma.
5. No publicar contenido scrapeado automáticamente. Solo `PUBLISHED` en API, APPLY+VERIFIED para postular; unknown→nulo/TO_CONFIRM.
6. No auth, perfiles, favoritos, notificaciones, LLM obligatorio, microservicios ni panel público admin en P0.
7. No modificar lockfile desde DEV 1; solo DEV 2 es propietario de root, migraciones y CI.
8. Si fase requiere colaboración, aprobar primero contrato independiente, luego consumirlo desde la carpeta propia.
9. DEV 2 prepara contrato+bootstrap inicial y DEV 1 revisa antes de iniciar trabajo paralelo.
10. No dar por terminado el MVP sin cumplir 29 historias P0 y pruebas integradas reales.
