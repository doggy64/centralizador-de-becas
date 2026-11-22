# Ejecutar la web de S1

Con Node 24 y npm, desde `apps/web`, instalar las dependencias con `npm install --no-package-lock`. El manifiesto local fija las versiones directas hasta que DEV 2 integre el workspace.

1. En una terminal, ejecutar `node scripts/mock-api.mjs`. Sirve datos ficticios en `127.0.0.1:4010`.
2. En otra terminal, ejecutar `npm run dev` y abrir `http://localhost:3000`. La web consulta el mock desde el servidor. Para probar NestJS, establecer `API_BASE_URL` en `.env.local` con la dirección del backend.
3. Ejecutar `npm run lint`, `npm run typecheck`, `npm test` y `npm run build`.
4. Para las pruebas de navegador, instalar Chromium con `npx playwright install chromium` y ejecutar `npm run test:e2e`. En Windows con Edge instalado se puede usar `$env:PLAYWRIGHT_CHANNEL='msedge'`. Playwright inicia su propia web y su propio mock.

Los tipos versionados en `src/lib/api/generated.ts` se generan con `npm run generate:api` desde el OpenAPI del checkout. Para el primer PR independiente, el archivo generado permite compilar mientras se incorpora el contrato al monorepo.
