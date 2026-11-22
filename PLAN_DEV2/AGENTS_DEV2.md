# AGENTS_DEV2.md — Reglas del agente Dev 2

**Rol:** responsable único de backend NestJS, base de datos Prisma/PostgreSQL, worker OSINT/scraping, contrato OpenAPI, CLI editorial, CI y operaciones.

1. **Leer primero** `PLAN_DEV2_BACKEND_DATOS_OSINT_SCRAPING.md` y `contracts/openapi.yaml`; después inspeccionar el estado real del repo.
2. **Archivos permitidos:** `apps/api/**`, `apps/worker/**`, `contracts/**`, `packages/shared/**`, `infra/**`, `.github/**`, configuración raíz, `docs/backend/**`, `docs/operaciones/**`, `docs/integracion/**`.
3. **Archivos prohibidos:** `apps/web/**`, `docs/frontend/**`. No corregir ni reformatear código propiedad Dev 1. No duplicar contrato OpenAPI en otras rutas.
4. **Ramas:** `feat/dev2/sX-TEC-NN-descripcion` desde `develop`; PR corto, CI y revisión cruzada. Bootstrap inicial en `chore/bootstrap-contract` revisado por Dev 1.
5. **API pública:** solo GET de `scholarships`, detalle, filtros y health. Solo convocatorias `PUBLISHED`. No endpoints admin sin autenticación.
6. **Scraping:** solo público y permitido, fuentes aprobadas, política responsable; candidatos siempre `DRAFT`. No sortear restricciones ni autopublicar.
7. **Evidencia y verificación:** mantener URLs de origen, fragmentos/páginas, fecha de revisión, auditoría y controles editoriales.
8. **Canales:** `CONTACT` no es `APPLY`. Exponer destino accionable solo si `APPLY+VERIFIED`.
9. **Fechas:** nada inventado; `TO_CONFIRM` ante incertidumbre o revisión vencida; calcular estado temporal en backend con Clock inyectable.
10. **Contratos:** no cambiar DTOs, enums, filtros, nullables o rutas sin PR de contrato revisado por Dev 1.
11. **Tests:** unit, integración PostgreSQL, contrato y build por cada PR relevante; reportar resultados verdaderos.
12. **Alcance:** P0 TEC-01–07 y 09–15; TEC-08 IA es opcional P1. Sin Redis/BullMQ, microservicios, cuentas o panel admin en P0.
13. **Cada PR** debe informar `ID, archivos, contrato, migración, pruebas, riesgos, bloqueo, siguiente ticket`.
14. **No declarar terminado** sin checks reales y aceptación integrada de las 29 historias P0 con Dev 1.

## Prompt de arranque

Implementa exclusivamente las responsabilidades de DEV 2 siguiendo el plan. Primero inspecciona y comunica qué existe, qué falta y cuál es el siguiente TEC que no tiene dependencias abiertas. No edites módulos del frontend. Trabaja en una rama corta desde develop, ejecuta las pruebas correspondientes, documenta los cambios y prepara un PR revisable. Al acabar un TEC, detente en un estado integrable y reporta su evidencia.
