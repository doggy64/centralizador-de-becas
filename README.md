# Centralizador de becas

## Arranque del backend

Use la versión de Node indicada en .nvmrc y Corepack con el pnpm fijado en package.json. Desde la raíz ejecute:

```sh
pnpm install --frozen-lockfile
pnpm build
```

Con el .env de Supabase configurado, ejecute `pnpm start:api`. Compruebe la lectura en http://localhost:3001/api/v1/catalogs/filters. Para ejecutar en contenedores use `docker compose --env-file .env -f infra/services.yaml up -d --build --wait api`.

## Demo y pruebas

Para preparar una ficha sintética de desarrollo y arrancar la API, configure `TEST_DATABASE_URL` local con una base cuyo nombre termine en `_test`, luego ejecute `pnpm demo:prepare` y `pnpm demo:start`. La API escucha por defecto en http://localhost:3001. GET /health responde con {"status":"ok"}. El detalle de demostración está disponible en `/api/v1/scholarships/programa-de-prueba-edicion-2027-1`.

Para la demo y CI, configure POSTGRES_TEST_PASSWORD y TEST_DATABASE_URL en un entorno de pruebas. Levante la base temporal con `docker compose --env-file .env -f infra/compose.test.yaml up -d --wait db-test`. Escucha en el puerto 5434.

Ejecute `pnpm -r test`, `pnpm --filter @becas/api test:integration`, `pnpm -r lint`, `pnpm -r typecheck`, `pnpm format:check` y `pnpm contracts:validate`. La CLI editorial usa `pnpm editorial --help`. El contrato v1 y sus ejemplos sintéticos están en contracts/. Las rutas de integración y operación están documentadas en docs/integracion/ y docs/operaciones/.
