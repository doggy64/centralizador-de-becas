# Progreso DEV 1 — Frontend MVP de becas

## Estado general

**Contrato API base:** pendiente de aprobación en PR bootstrap.  
**Entorno:** Next.js autónomo en `apps/web` con el mock HTTP de desarrollo. El monorepo sigue pendiente.
**Fase actual:** S2, avance frontend autorizado contra mock.
**Integración:** pendiente de revisión cruzada y ejecución contra la API real.

| Fecha | Historia | Fase | Estado | Rutas tocadas | Pruebas | Dependencia API | PR |
|---|---|---|---|---|---|---|---|
| 2026-11-22 | MVP-001 | S1 | Verificada con mock | apps/web y docs/frontend | Lint, typecheck y build OK. HTTP y parámetros 3/3. Playwright 6/6 | OpenAPI v1 local y mock | [#1](https://github.com/doggy64/centralizador-de-becas/pull/1) |
| 2026-11-22 | MVP-002 | S1 | Verificada con mock | Inicio, E2E y capturas | Lint, typecheck y build OK. HTTP y parámetros 3/3. Playwright 8/8 | MVP-001 y mock | [PR de MVP-002](https://github.com/doggy64/centralizador-de-becas/pulls?q=head%3Afeat%2Fdev1%2Fs1-MVP-002-inicio) |

## Revisión inicial del 22 de noviembre

- Se creó `develop` en el commit inicial `d75ae91` de `main`. Sigue pendiente el PR de bootstrap de DEV 2 con el contrato y los manifiestos del workspace, el lockfile y los scripts de lint, typecheck y build.
- El borrador OpenAPI 3.0.3, versión 1.0.0, define cuatro GET para salud, listado, detalle por slug y catálogos. Antes de congelarlo, DEV 2 debe conciliar los esquemas NullableModality, NullableCoverage y NullableTemporalStatus con la fixture de listado. La fixture usa null y los enum omiten ese valor.
- En Windows con Node 24.15.0 la prueba del kit falló al esperar `/health`. Se corrigió el lanzamiento del mock usando `fileURLToPath`. Con acceso a loopback, `node --test apps/web/tests/mock-api.test.mjs` pasó (1/1). Cubre búsqueda combinada, detalle, canal pendiente, resultado vacío, respuestas 400 y 404 y acceso a catálogos.
- Por indicación del responsable del proyecto, DEV 1 continúa S1 contra el mock antes de integrar el baseline. Las dependencias directas de la web se fijan localmente en `apps/web/package.json`.

## Evidencia de aceptación frontend

MVP-006 incorpora navegación de páginas desde los metadatos de la API. Los enlaces preservan la consulta y quedan inactivos cuando no existe una página anterior o siguiente. Pasaron lint, typecheck, build, 3 pruebas HTTP/parámetros y 16 E2E. La evidencia visual se generó durante la prueba de escritorio y móvil. Rama `feat/dev1/s2-MVP-006-paginacion`, dependiente de MVP-004.

MVP-004 muestra el total y el término aplicado. La prueba consulta INGENIERIA, edita a medicina, recarga la URL, vacía el término y busca por institución y programa. Pasaron lint, typecheck, build, 3 pruebas HTTP/parámetros y 14 E2E. Capturas en `evidencia/MVP-004/`. Playwright produjo un aviso de hidratación asociado a su estilo temporal caret-color durante capturas. La tolerancia de acentos se verificó contra el mock y sigue pendiente contra la API real. Rama `feat/dev1/s2-MVP-004-busqueda`, dependiente del PR #3.

MVP-003 agrega destino y nivel con etiquetas del catálogo HTTP y plazo original con ausencia explícita. Verificación del 22 de noviembre con lint, typecheck, build, 3 pruebas HTTP/parámetros y 10 pruebas Playwright aprobadas. Capturas en `evidencia/MVP-003/`. La consulta del remoto sigue mostrando develop en d75ae91, sin entregas de DEV 2. Se continúa por indicación del usuario, con aceptación editorial e integración real pendientes. La rama `feat/dev1/s2-MVP-003-catalogo` depende de los PR #1 y #2.

La prueba de MVP-001 recorrió inicio, catálogo y ficha con un navegador nuevo, abrió el destino externo sintético y comprobó la ausencia del enlace ante un canal pendiente. La primera corrida agotó la espera de cinco segundos al cargar la ficha en escritorio. Con la espera de compilación ajustada, la suite completa pasó en ambos tamaños. Capturas de la ficha en [360 px](evidencia/MVP-001/mobile.png) y [1280 px](evidencia/MVP-001/desktop.png).

MVP-002 muestra el propósito de la plataforma y permite entrar al catálogo completo o buscar desde el inicio. La prueba envió «Ingeniería» con Enter, comprobó la URL y el resultado y regresó para abrir el listado completo. Verificó el ancho sin desbordes en [360 px](evidencia/MVP-002/mobile.png) y [1280 px](evidencia/MVP-002/desktop.png).

## Bloqueos/solicitudes a DEV 2

- Confirmar OpenAPI v1 y el paquete de generación de tipos.
- Confirmar nombres de workspace scripts, Node/pnpm y .gitignore para `.env.local`.

## Protocolo

Registrar pruebas **realmente ejecutadas**, fallos y capturas por historia. No marcar historias P0 Done sin validación E2E real cuando corresponda.
