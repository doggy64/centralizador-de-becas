# Progreso DEV 1 — Frontend MVP de becas

## Estado general

**Contrato API base:** pendiente de aprobación en PR bootstrap.  
**Entorno:** Next.js autónomo en `apps/web` con el mock HTTP de desarrollo. El monorepo sigue pendiente.
**Fase actual:** S1.  
**Integración:** pendiente de revisión cruzada y ejecución contra la API real.

| Fecha | Historia | Fase | Estado | Rutas tocadas | Pruebas | Dependencia API | PR |
|---|---|---|---|---|---|---|---|
| 2026-11-22 | MVP-001 | S1 | Verificada con mock | apps/web y docs/frontend | Lint, typecheck y build OK. HTTP y parámetros 3/3. Playwright 6/6 | OpenAPI v1 local y mock | [#1](https://github.com/doggy64/centralizador-de-becas/pull/1) |
| 2026-11-22 | MVP-002 | S1 | Pendiente | — | Búsqueda desde inicio y navegación móvil/desktop | MVP-001 | — |

## Revisión inicial del 22 de noviembre

- Se creó `develop` en el commit inicial `d75ae91` de `main`. Sigue pendiente el PR de bootstrap de DEV 2 con el contrato y los manifiestos del workspace, el lockfile y los scripts de lint, typecheck y build.
- El borrador OpenAPI 3.0.3, versión 1.0.0, define cuatro GET para salud, listado, detalle por slug y catálogos. Antes de congelarlo, DEV 2 debe conciliar los esquemas NullableModality, NullableCoverage y NullableTemporalStatus con la fixture de listado. La fixture usa null y los enum omiten ese valor.
- En Windows con Node 24.15.0 la prueba del kit falló al esperar `/health`. Se corrigió el lanzamiento del mock usando `fileURLToPath`. Con acceso a loopback, `node --test apps/web/tests/mock-api.test.mjs` pasó (1/1). Cubre búsqueda combinada, detalle, canal pendiente, resultado vacío, respuestas 400 y 404 y acceso a catálogos.
- Por indicación del responsable del proyecto, DEV 1 continúa S1 contra el mock antes de integrar el baseline. Las dependencias directas de la web se fijan localmente en `apps/web/package.json`.

## Bloqueos/solicitudes a DEV 2

La prueba de MVP-001 recorrió inicio, catálogo y ficha con un navegador nuevo, abrió el destino externo sintético y comprobó la ausencia del enlace ante un canal pendiente. La primera corrida agotó la espera de cinco segundos al cargar la ficha en escritorio. Con la espera de compilación ajustada, la suite completa pasó en ambos tamaños. Capturas de la ficha en [360 px](evidencia/MVP-001/mobile.png) y [1280 px](evidencia/MVP-001/desktop.png).

- Confirmar OpenAPI v1 y el paquete de generación de tipos.
- Confirmar nombres de workspace scripts, Node/pnpm y .gitignore para `.env.local`.

## Protocolo

Registrar pruebas **realmente ejecutadas**, fallos y capturas por historia. No marcar historias P0 Done sin validación E2E real cuando corresponda.
