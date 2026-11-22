# Progreso DEV 1 — Frontend MVP de becas

## Estado general

**Contrato API base:** pendiente de aprobación en PR bootstrap.  
**Entorno:** pendiente de inicialización de monorepo por DEV 2.  
**Fase actual:** S1.  
**Historias completas:** ninguna; los scripts del kit son ejemplos y no sustituyen la integración Next.js.

| Fecha | Historia | Fase | Estado | Rutas tocadas | Pruebas | Dependencia API | PR |
|---|---|---|---|---|---|---|---|
| 2026-11-22 | MVP-001 | S1 | Bloqueada antes de implementar | — | Pendiente E2E de acceso anónimo a inicio, catálogo y ficha | Bootstrap en develop | — |
| 2026-11-22 | MVP-002 | S1 | Bloqueada antes de implementar | — | Pendiente E2E de búsqueda desde inicio y navegación móvil/desktop | MVP-001 y bootstrap | — |

## Revisión inicial del 22 de noviembre

- Se creó `develop` en el commit inicial `d75ae91` de `main`. Sigue pendiente el PR de bootstrap de DEV 2 con el contrato y los manifiestos del workspace, el lockfile y los scripts de lint, typecheck y build.
- El borrador OpenAPI 3.0.3, versión 1.0.0, define cuatro GET para salud, listado, detalle por slug y catálogos. Antes de congelarlo, DEV 2 debe conciliar los esquemas NullableModality, NullableCoverage y NullableTemporalStatus con la fixture de listado. La fixture usa null y los enum omiten ese valor.
- En Windows con Node 24.15.0 la prueba del kit falló al esperar `/health`. Se corrigió el lanzamiento del mock usando `fileURLToPath`. Con acceso a loopback, `node --test apps/web/tests/mock-api.test.mjs` pasó (1/1). Cubre búsqueda combinada, detalle, canal pendiente, resultado vacío, respuestas 400 y 404 y acceso a catálogos.
- La prueba ejercita HTTP. Las comprobaciones de interfaz y las capturas de ambas historias quedan pendientes del baseline integrado.

## Bloqueos/solicitudes a DEV 2

- Confirmar OpenAPI v1 y el paquete de generación de tipos.
- Confirmar nombres de workspace scripts, Node/pnpm y .gitignore para `.env.local`.

## Protocolo

Registrar pruebas **realmente ejecutadas**, fallos y capturas por historia. No marcar historias P0 Done sin validación E2E real cuando corresponda.
