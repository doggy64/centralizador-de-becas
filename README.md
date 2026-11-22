# Centralizador de becas

## Arranque local del backend

Use la versión de Node indicada en .nvmrc y Corepack con el pnpm fijado en package.json. Desde la raíz ejecute:

```sh
pnpm install --frozen-lockfile
pnpm -r build
pnpm --filter @becas/api start
```

La API escucha por defecto en http://localhost:3001. GET /health responde con {"status":"ok"}. Para cambiar el puerto, exporte PORT en el entorno del proceso. En otra terminal, ejecute el worker de S0 con `pnpm --filter @becas/worker start --health`.

Copie .env.example a .env y asigne contraseñas locales distintas para los dos servicios. Para PostgreSQL ejecute `docker compose --env-file .env -f infra/compose.yaml up -d --wait`. Desarrollo usa el puerto 5433, base y usuario becas. Pruebas usa 5434, base y usuario becas_test, con almacenamiento temporal. DATABASE_URL y TEST_DATABASE_URL son las URI PostgreSQL correspondientes para la futura persistencia. NEXT_PUBLIC_API_BASE_URL es la URL base para DEV 1.

Ejecute `pnpm -r test`, `pnpm -r lint`, `pnpm -r typecheck`, `pnpm format:check` y `pnpm contracts:validate`. La propuesta de contrato v1 y sus ejemplos sintéticos están en contracts/. Consulte docs/backend/progreso.md para ver los resultados y la revisión pendiente.
