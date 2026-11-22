# Progreso DEV 1 — Frontend MVP de becas

## Estado general

**2026-11-22 — Dirección visual frontend:** rediseño de home, navegación, catálogo y ficha con la identidad «Becas en ruta». Se añadió la cartografía abstracta del hero, paleta azul/jade/amarillo, tipografía sans de sistema, jerarquía responsive y estados de foco/movimiento reducido. Se documentó el sistema en `docs/frontend/identidad-visual.md`. Validación automatizada pendiente.

**Contrato API base:** OpenAPI 3.0.3 v1.0.0 en `contracts/openapi.yaml`, revisado contra `origin/develop` (`edf4284`).
**Entorno:** Next.js autónomo en `apps/web` con mock HTTP de desarrollo y modo explícito de E2E real.
**Fase actual:** S4 frontend implementada; integración real bloqueada por el entorno local.
**Integración:** DEV2 fusionó su entrega en `develop` (PR #9). El 2026-11-22 no fue posible iniciar PostgreSQL: Docker Desktop no expone `dockerDesktopLinuxEngine`. Además, `pnpm install --frozen-lockfile` no es reproducible para el workspace web desde `develop`; ambos puntos son de propiedad DEV2/root y no se modificaron desde frontend.

| Fecha | Historia | Fase | Estado | Rutas tocadas | Pruebas | Dependencia API | PR |
|---|---|---|---|---|---|---|---|
| 2026-11-22 | MVP-001 | S1 | Verificada con mock | apps/web y docs/frontend | Lint, typecheck y build OK. HTTP y parámetros 3/3. Playwright 6/6 | OpenAPI v1 local y mock | [#1](https://github.com/doggy64/centralizador-de-becas/pull/1) |
| 2026-11-22 | MVP-002 | S1 | Verificada con mock | Inicio, E2E y capturas | Lint, typecheck y build OK. HTTP y parámetros 3/3. Playwright 8/8 | MVP-001 y mock | [PR de MVP-002](https://github.com/doggy64/centralizador-de-becas/pulls?q=head%3Afeat%2Fdev1%2Fs1-MVP-002-inicio) |
| 2026-11-22 | MVP-032 | S4 | Preparada para integración; bloqueo externo documentado | Playwright, E2E y progreso | Lint, typecheck, test mock 3/3, Playwright mock 44 casos y build OK; Docker no disponible para E2E real | OpenAPI v1 / API DEV2 en `develop` | Pendiente |
| 2026-11-22 | MVP-027 | S3 | Verificada con mock | Catálogo y utilidad de presentación | Lint, typecheck, test mock 4/4, build y Playwright catálogo 4/4 OK | OpenAPI v1: slug identifica una edición | Pendiente |

## Revisión inicial del 22 de noviembre

- Se creó `develop` en el commit inicial `d75ae91` de `main`. Sigue pendiente el PR de bootstrap de DEV 2 con el contrato y los manifiestos del workspace, el lockfile y los scripts de lint, typecheck y build.
- El borrador OpenAPI 3.0.3, versión 1.0.0, define cuatro GET para salud, listado, detalle por slug y catálogos. Antes de congelarlo, DEV 2 debe conciliar los esquemas NullableModality, NullableCoverage y NullableTemporalStatus con la fixture de listado. La fixture usa null y los enum omiten ese valor.
- En Windows con Node 24.15.0 la prueba del kit falló al esperar `/health`. Se corrigió el lanzamiento del mock usando `fileURLToPath`. Con acceso a loopback, `node --test apps/web/tests/mock-api.test.mjs` pasó (1/1). Cubre búsqueda combinada, detalle, canal pendiente, resultado vacío, respuestas 400 y 404 y acceso a catálogos.
- Por indicación del responsable del proyecto, DEV 1 continúa S1 contra el mock antes de integrar el baseline. Las dependencias directas de la web se fijan localmente en `apps/web/package.json`.

## Evidencia de aceptación frontend

MVP-029 y MVP-030 refuerzan los objetivos táctiles, el salto al contenido, el foco de `main`, la navegación de catálogo por teclado y la adaptación a 360 px. Lint y typecheck pasaron. Las cuatro pruebas Playwright de accesibilidad y diseño móvil pasaron en escritorio y móvil. Rama `feat/dev1/s4-MVP-029-030-accesibilidad`.

MVP-024, MVP-025 y MVP-026 distinguen edición vigente, representan CLOSED de forma visual y anuncian los datos pendientes de verificación. No se recalcula vigencia en la web. Lint y typecheck pasaron. Las seis pruebas Playwright de ficha pasaron en escritorio y móvil. Rama `feat/dev1/s3-MVP-024-025-026-edicion-estados`.

MVP-020 y MVP-021 presentan el acceso de postulación solo con canal APPLY y VERIFIED. Los portales se anuncian como destinos externos, los correos usan mailto y los canales pendientes no generan CTA. Lint y typecheck pasaron. Las seis pruebas Playwright públicas pasaron en escritorio y móvil. Rama `feat/dev1/s3-MVP-020-021-postulacion-segura`.

MVP-019, MVP-022 y MVP-023 muestran inicio y cierre con la precisión devuelta por API, la fuente original y la última revisión. Las fechas sin respaldo pasan a «Pendiente de verificación». Lint y typecheck pasaron. Las cuatro pruebas de ficha pasaron en escritorio y móvil. Rama `feat/dev1/s3-MVP-019-022-023-fechas-fuente`.

MVP-018 presenta cobertura y beneficios confirmados por la API. No agrega montos ni condiciones cuando el objeto no los informa. Lint y typecheck pasaron. Las cuatro pruebas Playwright de ficha pasaron en escritorio y móvil. Rama `feat/dev1/s3-MVP-018-beneficios-cobertura`.

MVP-016 y MVP-017 muestran requisitos y documentos en secciones legibles. Cada ausencia llega como «No especificado» sin inferir condiciones de postulación. Lint y typecheck pasaron. Las cuatro pruebas Playwright de la ficha pasaron en escritorio y móvil. Rama `feat/dev1/s3-MVP-016-017-requisitos-documentos`.

MVP-005, MVP-012 y MVP-013 añaden vigencia desde el estado API, filtros combinables, controles para quitar cada criterio, limpieza de la URL y un estado vacío recuperable. Lint y typecheck pasaron. Las cuatro pruebas Playwright dedicadas pasaron en escritorio y móvil. Rama `feat/dev1/s3-MVP-005-012-013-filtros-activos`.

MVP-007 a MVP-011 incorporan filtros individuales por nivel, área, país de destino, modalidad y cobertura. Los valores provienen de los catálogos de la API. La URL conserva el término de búsqueda y descarta parámetros vacíos. Lint, typecheck y build pasaron. Las 12 pruebas Playwright específicas pasaron en escritorio y móvil.

MVP-015 amplía la ficha con organizador, programa, edición, nivel, destino y modalidad del contrato. Los valores ausentes usan «No especificado». Lint y typecheck pasaron. Las cuatro pruebas Playwright de ficha pasaron en escritorio y móvil.

MVP-006 incorpora navegación de páginas desde los metadatos de la API. Los enlaces preservan la consulta y quedan inactivos cuando no existe una página anterior o siguiente. Pasaron lint, typecheck, build, 3 pruebas HTTP/parámetros y 16 E2E. La evidencia visual se generó durante la prueba de escritorio y móvil. Rama `feat/dev1/s2-MVP-006-paginacion`, dependiente de MVP-004.

MVP-004 muestra el total y el término aplicado. La prueba consulta INGENIERIA, edita a medicina, recarga la URL, vacía el término y busca por institución y programa. Pasaron lint, typecheck, build, 3 pruebas HTTP/parámetros y 14 E2E. Capturas en `evidencia/MVP-004/`. Playwright produjo un aviso de hidratación asociado a su estilo temporal caret-color durante capturas. La tolerancia de acentos se verificó contra el mock y sigue pendiente contra la API real. Rama `feat/dev1/s2-MVP-004-busqueda`, dependiente del PR #3.

MVP-003 agrega destino y nivel con etiquetas del catálogo HTTP y plazo original con ausencia explícita. Verificación del 22 de noviembre con lint, typecheck, build, 3 pruebas HTTP/parámetros y 10 pruebas Playwright aprobadas. Capturas en `evidencia/MVP-003/`. La consulta del remoto sigue mostrando develop en d75ae91, sin entregas de DEV 2. Se continúa por indicación del usuario, con aceptación editorial e integración real pendientes. La rama `feat/dev1/s2-MVP-003-catalogo` depende de los PR #1 y #2.

La prueba de MVP-001 recorrió inicio, catálogo y ficha con un navegador nuevo, abrió el destino externo sintético y comprobó la ausencia del enlace ante un canal pendiente. La primera corrida agotó la espera de cinco segundos al cargar la ficha en escritorio. Con la espera de compilación ajustada, la suite completa pasó en ambos tamaños. Capturas de la ficha en [360 px](evidencia/MVP-001/mobile.png) y [1280 px](evidencia/MVP-001/desktop.png).

MVP-002 muestra el propósito de la plataforma y permite entrar al catálogo completo o buscar desde el inicio. La prueba envió «Ingeniería» con Enter, comprobó la URL y el resultado y regresó para abrir el listado completo. Verificó el ancho sin desbordes en [360 px](evidencia/MVP-002/mobile.png) y [1280 px](evidencia/MVP-002/desktop.png).

## Bloqueos/solicitudes a DEV 2

- Habilitar Docker Desktop/Linux engine o proporcionar una API+BD de prueba accesible para ejecutar `E2E_API_BASE_URL=http://127.0.0.1:3001 pnpm --filter @becas/web test:e2e`.
- Corregir o regenerar el lockfile de `develop` para que `pnpm install --frozen-lockfile` incluya `apps/web`; DEV1 no puede modificarlo.
- Confirmar el procedimiento de preparación de datos de prueba para la ruta de integración.

## Protocolo

Registrar pruebas **realmente ejecutadas**, fallos y capturas por historia. No marcar historias P0 Done sin validación E2E real cuando corresponda.
