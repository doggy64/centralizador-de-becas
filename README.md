# Centralizador de becas

## Arranque del backend

Use la versión de Node indicada en .nvmrc y Corepack con el pnpm fijado en package.json. Desde la raíz ejecute:

```sh
pnpm install --frozen-lockfile
pnpm build
```

Con el .env de Supabase configurado, ejecute `pnpm start:api`. Compruebe la lectura en http://localhost:3001/api/v1/catalogs/filters. Para ejecutar en contenedores use `docker compose --env-file .env -f infra/services.yaml up -d --build --wait api`.

## Interfaz web

Para desarrollo, configure `API_BASE_URL=http://127.0.0.1:3001` en `apps/web/.env.local`, arranque NestJS y ejecute `pnpm --filter @becas/web dev` desde la raíz. Abra `http://localhost:3000` para explorar el catálogo. La foto, el icono y los estilos forman parte de la aplicación Next.js.

La consola en `/operadores` crea búsquedas y consulta su informe por ID. En el entorno del servidor web, configure `OPERATOR_PASSWORD` como contraseña de la consola y `SEARCH_ADMIN_TOKEN` con el valor usado por NestJS. Al solicitarlo el navegador, use el usuario `operador` y la contraseña de la consola. Next.js envía el token a NestJS desde el servidor. Sirva la consola mediante HTTPS fuera de localhost. El worker debe estar activo para procesar trabajos. Las vistas de fuentes, ingesta y revisión en `/operadores/editorial/fuentes` son una demostración local.

## Demo y pruebas

Para preparar una ficha sintética de desarrollo y arrancar la API, configure `TEST_DATABASE_URL` local con una base cuyo nombre termine en `_test`, luego ejecute `pnpm demo:prepare` y `pnpm demo:start`. La API escucha por defecto en http://localhost:3001. GET /health responde con {"status":"ok"}. El detalle de demostración está disponible en `/api/v1/scholarships/programa-de-prueba-edicion-2027-1`.

Para la demo y CI, configure POSTGRES_TEST_PASSWORD y TEST_DATABASE_URL en un entorno de pruebas. Levante la base temporal con `docker compose --env-file .env -f infra/compose.test.yaml up -d --wait db-test`. Escucha en el puerto 5434.

Ejecute `pnpm -r test`, `pnpm --filter @becas/api test:integration`, `pnpm -r lint`, `pnpm -r typecheck`, `pnpm format:check` y `pnpm contracts:validate`. La CLI editorial usa `pnpm editorial --help`. El contrato v1 y sus ejemplos sintéticos están en contracts/. Las rutas de integración y operación están documentadas en docs/integracion/ y docs/operaciones/.

## Buscar y publicar con una petición

La API recibe el trabajo y el worker lo ejecuta en segundo plano. Configure un valor aleatorio privado de al menos 32 caracteres en `SEARCH_ADMIN_TOKEN`. Aplique las migraciones con `pnpm --filter @becas/api db:migrate` y, en una base nueva, los roles y las semillas del runbook. En desarrollo arranque `pnpm start:api` y `pnpm editorial serve` en dos terminales. Con Compose levante los servicios `api worker`.

1. Registre una página de entrada institucional con permiso de rastreo mediante `pnpm editorial source URL crawl --actor OPERADOR --note "Motivo y alcance del permiso"`. Las fuentes de la semilla comienzan en modo manual. El worker parte de `Source.officialUrl`.
2. Para revisar la extracción inicial, use `publish: false`. Para publicar automáticamente, configure los hosts exactos ya evaluados en `SEARCH_PUBLISH_HOSTS`, separados por comas, y envíe `publish: true`. El actor registrado en el historial es `worker-busquedas`. Las ediciones con intervención editorial previa requieren revisión humana.
3. Envíe la solicitud desde un cliente de confianza. Este ejemplo de PowerShell espera el token en la variable de entorno de la terminal.

```powershell
$headers = @{ Authorization = "Bearer $env:SEARCH_ADMIN_TOKEN"; "Idempotency-Key" = [guid]::NewGuid().ToString() }
$body = @{ query = "becas de maestría para postulantes de Bolivia"; publish = $true } | ConvertTo-Json
$job = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:3001/admin/busquedas" -Headers $headers -ContentType "application/json; charset=utf-8" -Body $body
Invoke-RestMethod -Uri ("http://127.0.0.1:3001" + $job.statusUrl) -Headers $headers
```

El POST devuelve HTTP 202. Reutilice el mismo UUID para reintentar la petición y genere uno nuevo para volver a buscar actualizaciones. El GET es opcional. `report.results` detalla la ficha o el motivo por URL, `published` y `pending` resumen los resultados y `documents` cuenta las consultas, extracciones y documentos reutilizados. El worker retoma las URLs pendientes al arrancar. Configure al menos dos conexiones en el pool del worker, una para coordinar la ejecución y otra para guardar el avance.

La consulta filtra por términos sobre los documentos. Con `BRAVE_SEARCH_API_KEY` el worker también envía la consulta al buscador y examina hasta diez resultados. Los dominios nuevos aparecen en el informe para autorización. Cada trabajo admite hasta 30 páginas de entrada y 40 lecturas de documentos entre páginas y anexos. Se comprueba robots.txt para cada destino. La caché persistente revalida el contenido con ETag, Last-Modified o su huella.

La extracción automática reconoce convocatorias con una edición en el título y campos rotulados en español o inglés. Para publicar exige cierre futuro inequívoco, beneficio, requisito y enlace de postulación designado por la fuente. Para búsquedas dirigidas a Bolivia exige evidencia explícita de elegibilidad. Una ficha ambigua queda en revisión. El detalle se verifica en la API configurada en `SEARCH_CATALOG_URL`. El PDF digital requiere las dependencias de `apps/worker/requirements.txt`. Para páginas escaneadas, instale los datos Tesseract de español e inglés y configure `TESSDATA_PREFIX`. La imagen del worker ya los incluye.
