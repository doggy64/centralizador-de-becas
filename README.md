# Centralizador de becas

## Arranque del backend

Use la versión de Node indicada en .nvmrc y Corepack con el pnpm fijado en package.json. Desde la raíz ejecute:

```sh
pnpm install --frozen-lockfile
pnpm build
```

Para preparar una ficha sintética de desarrollo y arrancar la API, configure `TEST_DATABASE_URL` local con una base cuyo nombre termine en `_test`, luego ejecute `pnpm demo:prepare` y `pnpm demo:start`. La API escucha por defecto en http://localhost:3001. GET /health responde con {"status":"ok"}. El detalle de demostración está disponible en `/api/v1/scholarships/programa-de-prueba-edicion-2027-1`.

Copie .env.example a .env y asigne contraseñas locales distintas para los dos servicios. Para PostgreSQL ejecute `docker compose --env-file .env -f infra/compose.yaml up -d --wait`. Desarrollo usa el puerto 5433, base y usuario becas. Pruebas usa 5434, base y usuario becas_test, con almacenamiento temporal. DATABASE_URL y TEST_DATABASE_URL son las URI PostgreSQL correspondientes para la futura persistencia. NEXT_PUBLIC_API_BASE_URL es la URL base para DEV 1.

Ejecute `pnpm -r test`, `pnpm --filter @becas/api test:integration`, `pnpm -r lint`, `pnpm -r typecheck`, `pnpm format:check` y `pnpm contracts:validate`. La CLI editorial usa `pnpm editorial --help`. El contrato v1 y sus ejemplos sintéticos están en contracts/. Las rutas de integración y operación están documentadas en docs/integracion/ y docs/operaciones/.
