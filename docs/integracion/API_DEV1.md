# Consumir la API desde DEV 1

La rama local acumulativa es `feat/dev2/s4-TEC-14-testing-deployment`. Contiene el bootstrap, las migraciones y las entregas anteriores. Un único checkout de esa punta basta. Configure `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001` en el cliente. La API conserva la forma de los JSON del kit.

## Arranque con el catálogo de Supabase

Desde la raíz, con el archivo `.env` configurado, ejecute `pnpm build` y `pnpm start:api`. El cliente puede consultar el catálogo real en `http://localhost:3001/api/v1/scholarships`.

## Demo opcional con una ficha sintética

Desde la raíz, con Node 22.22.2, Corepack y PostgreSQL 17, configure `POSTGRES_TEST_PASSWORD` para Compose en su entorno de pruebas. Configure `TEST_DATABASE_URL` como `postgresql://becas_test:<clave-de-pruebas>@127.0.0.1:5434/becas_test`, codificando la contraseña como componente de URL. Si utiliza PostgreSQL nativo, cree una base local cuyo nombre termine en `_test` y ajuste usuario y puerto. La demo funciona con la base de pruebas y la API real.

```sh
docker compose --env-file .env -f infra/compose.test.yaml up -d --wait
pnpm install --frozen-lockfile
pnpm build
pnpm demo:prepare
pnpm demo:start
```

Abra la [ficha de demostración](http://localhost:3001/api/v1/scholarships/programa-de-prueba-edicion-2027-1) y el [catálogo de filtros](http://localhost:3001/api/v1/catalogs/filters). La ficha sintética tiene nivel MASTER, destino BO, área ingenieria y vigencia TO_CONFIRM. `demo:prepare` aplica ambas migraciones, carga taxonomías y prepara esa edición en una base local de pruebas. Se puede repetir. La producción se alimenta mediante la CLI editorial.

## Contrato que consume la web

| GET | Uso |
|---|---|
| /health | Disponibilidad del proceso |
| /api/v1/catalogs/filters | Valores y etiquetas para construir los selectores |
| /api/v1/scholarships?q=prueba&level=MASTER&country=BO&page=1&limit=12 | Lista con data, meta y filters. Página desde 1, límite máximo 48 |
| /api/v1/scholarships/{slug} | Detalle publicado con procedencia, documentos, beneficios y canales |

La búsqueda ignora tildes y mayúsculas. Los filtros se combinan entre categorías y aceptan un valor por categoría. La UI puede limpiar un filtro omitiendo el parámetro. Cero coincidencias devuelve 200, lista vacía y total cero. Una consulta inválida devuelve 400. Una ficha privada o inexistente devuelve 404. El límite por IP devuelve 429 con el mismo sobre de error. El servidor ordena por slug para estabilizar la paginación.

El botón de postulación requiere APPLY, VERIFIED y urlOrEmail. En el detalle, una fecha de calendario conserva originalDeadlineText y deadline nulo. La revisión editorial y el cálculo de vigencia se ejecutan en el backend. La guía de tipos, campos y formatos está en `contracts/openapi.yaml`. Las tres fixtures validan sin modificar sus valores.

Para CI local, configure Python con PyMuPDF del archivo requirements.txt, exporte TEST_DATABASE_URL, ejecute `pnpm demo:prepare`, `pnpm -r test` y `pnpm --filter @becas/api test:integration`. La suite de integración crea registros sintéticos con claves únicas en esa base. El E2E del navegador corresponde a la rama integrada de DEV 1.
