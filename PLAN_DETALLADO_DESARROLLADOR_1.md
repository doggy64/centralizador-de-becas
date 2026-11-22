# PLAN DETALLADO DE IMPLEMENTACIÓN — DESARROLLADOR 1 (FRONTEND)

**Proyecto:** Centralizador Inteligente de Becas | **Release:** MVP público para estudiantes | **Rol:** DEV 1 / agente frontend  
**Versión del plan:** 1.0 | **Referencia:** Product Backlog MVP (32 HU, 29 P0, 3 P1) y kit para dos desarrolladores previamente acordado.

> **Objetivo medible:** un estudiante entra sin cuenta, busca y filtra convocatorias, abre una ficha con requisitos, beneficios, fechas, fuente y última verificación, y accede al formulario/correo oficial si el backend informa que el canal de postulación está verificado.

## 0. Instrucciones iniciales para el agente

1. Leer este plan, `AGENTS.md`, `00_PLAN_PARALELO.md`, el backlog y el contrato canónico `contracts/openapi.yaml` del kit general; verificar la versión que se acordó en la rama `develop`.
2. Inspeccionar `apps/web` antes de crear archivos. Reutilizar su estructura y componentes existentes; no destruir código de otro trabajo.
3. Esperar **solo a que se integre el baseline de monorepo y contrato**, no a que NestJS esté terminado. A partir de ese punto trabajar con API simulada.
4. Editar únicamente `apps/web/**` y `docs/frontend/**`. Los cambios a dependencias del workspace, `pnpm-lock.yaml`, `contracts/openapi.yaml`, `apps/api/**`, `apps/worker/**`, Prisma, CI raíz y `infra/**` pertenecen a DEV 2.
5. Crear PR pequeños desde `develop`, con IDs `MVP-###` en el título, pruebas y screenshots. **No marcar historia completada hasta pasar aceptación e integración necesaria**.
6. No inventar becas oficiales, fechas o correos. Las fixtures tienen nombres DEMO y `example.org`; son datos puramente sintéticos que no deben desplegarse en producción.

## 1. Alcance y propiedad exclusiva

### El DEV 1 sí implementa

- Inicio (`/`) y catálogo (`/becas`) sin login.
- Buscador por texto, filtros por nivel, área, destino, modalidad, cobertura y vigencia, chips activos, limpiar filtros, paginación y estados vacíos.
- Ficha (`/becas/[slug]`) con datos, requisitos, documentos, cobertura, plazo, institución, edición, fuentes y estado de verificación.
- Acceso a formularios o correos **solo cuando API devuelve canal `APPLY` y `VERIFIED`**.
- Diseño móvil a partir de 360 px, teclado, accesibilidad, error/404/loading, pruebas de componentes y E2E.
- Servidor HTTP **mock local dentro de `apps/web`**, cliente tipado y documentación frontend.

### El DEV 1 no implementa

- Endpoints NestJS, consultas SQL/Prisma, tablas/migraciones, scraper, PDF, OSINT, validación editorial, autenticación, emails de alerta, postulación dentro de la aplicación, recomendadores, IA de extracción o deployment infra.
- Una segunda definición del contrato HTTP. Si falta un campo, solicitarlo a DEV 2.
- Reglas de dominio: el frontend **representa** estado temporal, cobertura y verificación según API; no los calcula ni los certifica.

### Propiedad de archivos

| Puede crear/editar | Solo puede leer | Acción ante cambio necesario |
|---|---|---|
| `apps/web/src/app/**` | `apps/api/**` | Crear issue para DEV 2 |
| `apps/web/src/components/**` | `apps/worker/**` | Crear issue para DEV 2 |
| `apps/web/src/lib/**` y `apps/web/src/hooks/**` | `packages/**` y `contracts/**` | Solicitar cambio de contrato |
| `apps/web/scripts/**`, `apps/web/mock/**` | `infra/**`, `.github/**` | Solicitar cambio de CI o configuración |
| `apps/web/tests/**`, `apps/web/public/**` | Prisma, `pnpm-lock.yaml`, raíz del monorepo | DEV 2 actualiza lockfile y dependencias |
| `apps/web/.env.local` y `.env.example` | `AGENTS.md` y archivos comunes | Acordar el cambio antes de integrarlo |
| `docs/frontend/**` | `docs/backend/**`, `docs/integracion/**` | Registrar solicitud y documentación local |

> `apps/web/.env.local` **no debe versionarse**. Si `.gitignore` del repositorio no lo ignora, solicitar a DEV 2 el ajuste en root. No hacer cambios fuera de ownership.

## 2. Stack, arquitectura frontend y diseño

- **Next.js App Router**, **React**, **TypeScript strict**; versions exactas fijadas por DEV 2 en baseline.
- **Tailwind CSS** y **shadcn/ui** (únicamente componentes/dependencias acordados durante bootstrap), HTML semántico y CSS responsive.
- `fetch` desde **Server Components** para listados, filtros y fichas. Interacciones de filtros pueden ser un formulario GET hacia `/becas` o un Client Component que modifica `searchParams`, pero la fuente de verdad es la URL.
- **OpenAPI TypeScript** para generar `apps/web/src/lib/api/generated.ts` a partir de `contracts/openapi.yaml` sin editar dicho contrato. Dependencia/lockfile la incorpora DEV 2.
- **Servidor mock Node HTTP propio** para simular NestJS en localhost:4010. La misma función de consumo Next.js llamará a la API real cuando se cambie `API_BASE_URL`.
- **Playwright Test** para el flujo del estudiante (E2E) y Jest/Vitest disponible en la configuración común para pruebas unitarias.
- **Sin Zustand/Redux, sin SWR/TanStack Query en P0:** no se necesita estado global; filtros y paginación se expresan en la URL. Agregar librería solo si una necesidad concreta lo justifica y DEV 2 modifica lockfile.

### Arquitectura de componentes

```text
Página Next.js (Server Component)
    ├─ Lee searchParams / slug
    ├─ Llama a src/lib/api/scholarships.ts
    │       └─ src/lib/api/client.ts (fetch y errores)
    │               ├─ Desarrollo → http://127.0.0.1:4010 (mock Node)
    │               └─ Integración → http://127.0.0.1:3001 (NestJS)
    ├─ Renderiza tarjetas, etiquetas de estado, secciones de detalle
    └─ Client Components SOLO para UI interactiva (filtros, chips)
```

**Principios y patrones:** componente presentacional vs. página/contenedor de datos; capa API Adapter centralizada; Single Responsibility para filtros, tarjetas, plazos y canales; Dependency Inversion ligera mediante cliente HTTP; DRY para formateadores y estados; YAGNI para autenticación/estado global. No importar Prisma o entidades del servidor dentro de `apps/web`.

### Árbol de archivos objetivo

```text
apps/web/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                  # Inicio público
│  │  ├─ becas/page.tsx            # Listado y búsqueda
│  │  ├─ becas/[slug]/page.tsx     # Ficha por edición
│  │  ├─ error.tsx                 # Error boundary ('use client')
│  │  ├─ loading.tsx               # Skeleton
│  │  └─ not-found.tsx
│  ├─ components/
│  │  ├─ layout/{Header,Footer}.tsx
│  │  ├─ search/{SearchBar,SearchSummary}.tsx
│  │  ├─ filters/{FiltersPanel,FilterChips,ClearFilters}.tsx
│  │  └─ scholarship/{ScholarshipCard,ScholarshipList,StatusBadge,
│  │                     ScholarshipDetail,RequirementList,DocumentsList,
│  │                     BenefitsList,DatesPanel,SourcePanel,ApplyChannel}.tsx
│  ├─ lib/
│  │  ├─ api/{client,scholarships,generated}.ts
│  │  ├─ query-params/{parse,serialize}.ts
│  │  └─ format/{dates,labels,links}.ts
│  └─ hooks/                      # Solo si aporta valor al control UI
├─ mock/fixtures/scholarships.json
├─ scripts/mock-api.mjs
├─ tests/{unit,e2e,contract}/
├─ .env.example
└─ .env.local                    # NO versionar

docs/frontend/
└─ progreso.md
```

Los nombres son propuestos; conservar convenciones existentes si el baseline usa otra estructura. Los ejemplos del kit constituyen un **recorte ilustrativo**, no una aplicación Next.js completa inicializada.

## 3. Contrato API: la única fuente de verdad

| Método y ruta | Uso en web | Campos esenciales |
|---|---|---|
| `GET /api/v1/scholarships?q=&level=&area=&country=&modality=&coverage=&status=&page=&limit=` | Catálogo, búsqueda y filtros | `{data, meta, filters}`; `meta={page,limit,total,totalPages,hasNextPage}` |
| `GET /api/v1/scholarships/{slug}` | Detalle | `title, institution, programName, editionKey, requirements, requiredDocuments, benefits, dates, temporalStatus, applicationChannels, sourceOriginalUrl, lastVerifiedAt` |
| `GET /api/v1/catalogs/filters` | Opciones de filtro | `levels, areas, countries, modalities, coverages, statuses` |
| `GET /health` | Comprobación técnica, no UI pública | `{status:'ok'}` |

**Estados exactos:** `OPEN`, `UPCOMING`, `CLOSED`, `TO_CONFIRM`; modalidades `ON_SITE`, `ONLINE`, `HYBRID`, `UNKNOWN`; cobertura `FULL`, `PARTIAL`, `UNKNOWN`. La interfaz traduce etiquetas al español, pero conserva los valores del contrato.

**Canal:** solo `purpose === 'APPLY' && verificationStatus === 'VERIFIED' && urlOrEmail !== null` permite acción. `CONTACT` no es una postulación. Un correo se presenta con `mailto:` únicamente si viene verificado del backend. Si faltan datos, mostrar «No especificado» o «Por confirmar», nunca inferirlos.

**Importante:** el OpenAPI previo especifica parámetros de filtro simples (un valor por categoría). Para multiselección OR dentro de una categoría se requiere una extensión de contrato aprobada con DEV 2. El frontend no debe inventar parámetros repetidos ni arreglos separados por comas sin contrato.

## 4. Cómo trabajar con la API simulada sin backend (obligatorio)

### 4.1 Enfoque elegido

El mock es un **servidor HTTP local real**, limitado a `127.0.0.1:4010`, en `apps/web/scripts/mock-api.mjs`. Expone las mismas rutas y estructuras que NestJS, con fixtures sintéticas incluidas en `apps/web/mock/fixtures/scholarships.json`.

Se elige este enfoque porque las páginas de Next.js pueden ejecutar `fetch` en el **servidor**. Los interceptores `page.route()` de Playwright o mocks que viven solo en el navegador no interceptan necesariamente esas llamadas de Server Components. Un servidor mock local se comporta como la API real tanto para Server Components como para el navegador.

### 4.2 Arranque en dos terminales

Desde la raíz del repositorio, después del bootstrap de DEV 2:

```bash
# Terminal A: API simulada (sin PostgreSQL ni NestJS)
node apps/web/scripts/mock-api.mjs

# Terminal B: Next.js
# Crear apps/web/.env.local con API_BASE_URL=http://127.0.0.1:4010
pnpm --filter @becas/web dev
```

El mock usa el puerto **4010**, el frontend normalmente **3000** y el backend real normalmente **3001** (confirmar puertos reales con el equipo). Para probar la API simulada:

```bash
curl http://127.0.0.1:4010/health
curl "http://127.0.0.1:4010/api/v1/scholarships?q=ingenieria&level=MASTER"
curl http://127.0.0.1:4010/api/v1/scholarships/demo-ingenieria-2027
curl http://127.0.0.1:4010/api/v1/catalogs/filters
```

Se incluyen tres registros DEMO: uno abierto con canal ficticio marcado como verificado **solo para probar el botón**, uno con estado `TO_CONFIRM` y sin canal válido, y otro cerrado. Todos son ficticios y deben permanecer fuera de staging/producción.

### 4.3 El cliente es exactamente el mismo en mock y backend real

`apps/web/src/lib/api/client.ts` implementa `apiGet<T>()` con `fetch(..., {cache:'no-store'})`, control de status HTTP y variable **solo del servidor** `API_BASE_URL` (sin prefijo `NEXT_PUBLIC_`).

`apps/web/src/lib/api/scholarships.ts` expone exclusivamente:

```ts
searchScholarships(searchParams);
getScholarship(slug);
getCatalogFilters();
```

Estas funciones usan tipos generados desde OpenAPI. Ningún componente debe llamar a `fetch()` directamente ni acceder a fixtures; todos pasan por esta capa.

El comando de generación de tipos, **después de que DEV 2 registre la dependencia y se apruebe el contrato**, puede ser:

```bash
pnpm --filter @becas/web exec openapi-typescript ../../contracts/openapi.yaml -o src/lib/api/generated.ts
```

No editar `contracts/openapi.yaml` ni generar una copia de él en `apps/web`.

### 4.4 Conmutar hacia NestJS real sin tocar componentes

En desarrollo mock, `apps/web/.env.local` contiene:

```dotenv
API_BASE_URL=http://127.0.0.1:4010
```

Cuando DEV 2 publique el backend local, cambiar **únicamente la configuración** y reiniciar el proceso Next:

```dotenv
API_BASE_URL=http://127.0.0.1:3001
```

La estructura de respuesta, nombres de propiedades y rutas deben permanecer iguales. Si algo difiere, registrar una incidencia de contrato, no parchear componentes con `if (mock) ... else ...` ni redefinir DTOs. En producción `API_BASE_URL` es obligatorio y debe apuntar al backend real, no al mock; los ejemplos del kit incluyen una defensa que impide localhost en build de producción, pero igualmente hay que verificar la configuración de despliegue.

### 4.5 Escenarios de mock y pruebas

| Escenario | Cómo reproducir | Resultado de UI |
|---|---|---|
| Catálogo con resultados | `GET /api/v1/scholarships` | Tarjetas y total |
| Buscar por texto | `?q=ingenieria` | Resultados que corresponden al texto, sin distinguir tildes |
| Filtro combinado | `?level=MASTER&country=BO` | Intersección de filtros |
| Sin resultados | `?q=tema-inexistente` | Mensaje útil, opción limpiar |
| Paginación | `?page=2&limit=1` | Mantiene filtros y no duplica tarjetas |
| Ficha | `GET /.../demo-ingenieria-2027` | Detalle completo |
| Ficha inexistente | `GET /.../no-existe` | 404 accesible |
| Query inválida | `?limit=500` | Error 400 estructurado |
| Canal pendiente | Ficha `demo-medicina-por-confirmar` | NO se muestra botón de postulación |
| Error técnico | Header `x-mock-scenario: error` | Error 503 simulado para test del adaptador HTTP |
| Retardo | Header `x-mock-scenario: slow` | Spinner/skeleton durante carga |

Los headers especiales `x-mock-scenario` son **exclusivos de la API local**; no extender el contrato de producción con ellos. La capa HTTP puede inyectarlos en tests controlados sin cambiar el código público.

### 4.6 Qué debe comprobar DEV 1 antes de integrar

- La fixture de demo cumple el contrato OpenAPI o se alinea durante el PR inicial.
- Lista y detalle tienen mismo `slug` y campos coherentes.
- Las fechas no se recalculan en el cliente como si fueran fechas oficiales.
- Las URLs `example.org` no aparecen en un despliegue público como convocatorias auténticas.
- El botón de postulación solo aparece con `APPLY + VERIFIED`.
- Mocks no se usan en staging/producción y no se siembran en la BD real.

## 5. Plan detallado por fases (tareas, historias y pruebas)

### S1 — Preparación del frontend y navegación inicial

**Historias P0:** `MVP-001` y `MVP-002`.

**Dependencia de entrada:** DEV 2 integró el bootstrap del monorepo, scripts compartidos y contrato HTTP v1 en `develop`. No necesita backend funcional.

| Orden | Tarea de DEV 1 | Archivos propios | Aceptación / test |
|---|---|---|---|
| 1 | Inspeccionar baseline y confirmar scripts y versiones | `docs/frontend/progreso.md` | Inventario documentado, sin cambios en root |
| 2 | Crear/adaptar capa `apiGet`, cliente tipado y variables de servidor | `src/lib/api/*`, `.env.example` | Cliente alcanza mock; 400/404 se distinguen de caída de red |
| 3 | Copiar/crear fixtures sintéticas y servidor mock dentro de `apps/web` | `scripts/mock-api.mjs`, `mock/fixtures/*` | `/health`, listado y detalle accesibles sin NestJS |
| 4 | Crear layout, header/footer, accesos y páginas públicas | `app/layout.tsx`, `app/page.tsx`, `components/layout/*` | No hay registro ni login; CTA entra al catálogo |
| 5 | Crear SearchBar inicial con GET a `/becas` | `components/search/*` | Búsqueda se refleja en URL; teclado funciona |
| 6 | Añadir tests iniciales y docs | `tests/*`, `docs/frontend/progreso.md` | Lint, types, build y tests de navegación verdes |

**Gate S1:** home navegable sin autenticación; API simulada ejecutándose por separado; un campo de búsqueda genera URL correcta; contrato no alterado; PR a `develop` con capturas móvil/desktop.

### S2 — Catálogo, búsqueda, filtros básicos y ficha inicial

**Historias P0:** `MVP-003`, `MVP-004`, `MVP-006` a `MVP-011`, `MVP-015`; primera implementación de `MVP-032` (estados de carga/error).

| Orden | Tarea de DEV 1 | Implementación | Pruebas específicas |
|---|---|---|---|
| 1 | Catálogo y tarjetas (`MVP-003`) | `/becas`, `ScholarshipCard`, `ScholarshipList` | Solo campos del contrato; abre slug correcto |
| 2 | Búsqueda (`MVP-004`) | Query `q` en URL y `SearchBar` | Acentos, mayúsculas, input vacío, longitud máxima |
| 3 | Paginación (`MVP-006`) | `Pagination` con `meta` API | Mantiene filtros, no duplica resultados, `hasNextPage` correcto |
| 4 | Filtros por nivel y área (`MVP-007/008`) | `FiltersPanel` con catálogos API | Selección correcta, valores desconocidos no se inventan |
| 5 | Filtros país, modalidad y cobertura (`MVP-009/010/011`) | `<select>` / controles accesibles | País de **destino**, enum correcto, unknown explícito |
| 6 | Ficha básica (`MVP-015`) | `/becas/[slug]`, `ScholarshipDetail` | Título, institución, edición, descripción; 404 si no existe |
| 7 | Carga, error y reintento (`MVP-032` parcial) | `loading.tsx`, `error.tsx`, skeletons | 503 no luce como cero becas; CTA de reintento funciona |

**Gate S2:** flujo home → lista → buscar → filtrar → ficha funciona con mock; las tarjetas se corresponden con resultados; todo es responsive base, sin datos falsos fuera de entorno de desarrollo. Ejecutar unit+component+E2E contra mock local.

### S3 — Detalle completo, información fiable y postulación

**Historias P0:** `MVP-005`, `MVP-012`, `MVP-013`, `MVP-016` a `MVP-027`.

**Orden por dependencia:** detalle base → fecha y status → filtro vigencia → filtros combinados → empty → fuente y última verificación → canal de postulación; programa/edición → deduplicación.

| Paso | Historias | Tareas específicas de DEV 1 | Aceptación |
|---|---|---|---|
| 1 | `MVP-019`, `025` | Panel de fechas, estado OPEN/UPCOMING/CLOSED/TO_CONFIRM, formato respetando precisión | Nunca inventa horas ni considera OPEN a una beca sin verificación |
| 2 | `MVP-012` | Filtro por vigencia y badge en card y ficha | OPEN muestra solo lo marcado como OPEN por API |
| 3 | `MVP-013`, `005` | Combinar criterios; chips y botón limpiar; empty state | AND entre categorías, conservar query string y paginación razonable |
| 4 | `MVP-016`, `017` | Secciones requisitos y documentos | Listas legibles; ausentes como No especificado |
| 5 | `MVP-018` | Beneficios, cobertura y costes | FULL/PARTIAL/UNKNOWN coherentes; no inferir montos |
| 6 | `MVP-022`, `023` | Fuente original, institución y última verificación | Fuente visible, verificación distinta de fecha de publicación |
| 7 | `MVP-020`, `021` | Acción postulación web o mailto | CTA solo APPLY+VERIFIED; CONTACT no es APPLY |
| 8 | `MVP-024`, `027` | Visualización programa/edición, una tarjeta por edición | Slug identifica edición y no confunde años; duplicados no se duplican en UI (corrección pertenece a API) |
| 9 | `MVP-026` | Mensajes claros para campos sin confirmar y contradicciones señaladas por API | Nunca convierte falta de evidencia en hecho confirmado |

**Gate S3:** prueba E2E completa búsqueda → filtros → ficha → fuente → postulación **con backend real cuando esté listo**. Mock sirve como primera aceptación, pero no sustituye la prueba integrada. Enlace sin verificar permanece deshabilitado. No reimplementar validación editorial en el frontend.

### S4 — Accesibilidad, resiliencia e integración final

**Historias P0:** `MVP-029`, `MVP-030`; terminar `MVP-032`.

| Orden | Tarea | Comprobación |
|---|---|---|
| 1 | Revisar vista a 360px, tablet y desktop | Sin scroll horizontal que oculte contenido importante |
| 2 | Teclado, foco y lector de pantalla; etiquetado accesible | Tab, Enter, Escape, labels, headings, aria-live en resultados si procede |
| 3 | Estados loading/error/empty/404, retry | Simular API caída, consultas inválidas y slug inexistente |
| 4 | Modo API real: cambiar solo `API_BASE_URL` | No hay cambio de componentes ni mapeos ad hoc para NestJS |
| 5 | E2E real con API + base de datos seeded por DEV 2 | Todos los flujos esenciales, filtros, fuentes y enlaces funcionan |
| 6 | Documentar incidencias y criterios del backlog | PR final web y checklist de aceptación P0 trazable |

**Opcionales P1, solo después de cerrar P0:** `MVP-014` ordenar, `MVP-028` reporte de dato (requiere nuevo endpoint acordado con DEV 2), `MVP-031` copiar/compartir enlace de ficha.

**Gate S4:** pruebas responsive, teclado y flujo E2E con API real pasan; web no expone registros sintéticos en producción, no hay errores críticos y se han cumplido todos los criterios frontend P0.

### Trazabilidad explícita de las 29 historias P0 del frontend

| Fase | IDs de historias obligatorias | Resultado demostrable |
|---|---|---|
| **S1** | `MVP-001`, `MVP-002` | Inicio y acceso sin registro |
| **S2** | `MVP-003`, `MVP-004`, `MVP-006`, `MVP-007`, `MVP-008`, `MVP-009`, `MVP-010`, `MVP-011`, `MVP-015`, `MVP-032` (parcial) | Búsqueda, catálogo, filtros y ficha básica |
| **S3** | `MVP-005`, `MVP-012`, `MVP-013`, `MVP-016`, `MVP-017`, `MVP-018`, `MVP-019`, `MVP-020`, `MVP-021`, `MVP-022`, `MVP-023`, `MVP-024`, `MVP-025`, `MVP-026`, `MVP-027` | Requisitos, vigencia, fuentes y canal verificado |
| **S4** | `MVP-029`, `MVP-030`, cierre de `MVP-032` | Responsive, accesibilidad y calidad |

La historia `MVP-032` se inicia en S2 y se cierra en S4; **no se cuenta dos veces**. Las 3 P1 permanecen fuera de los gates obligatorios.

## 6. Matriz detallada de pruebas

| Tipo | Qué verificar | Cuándo | Ejecución |
|---|---|---|---|
| Unitarias | `encodeFilters`, etiquetas de estado, formateo de fecha parcial, visibilidad de enlace, query string | Cada PR afectado | `pnpm --filter @becas/web test` (si script configurado) |
| API mock | GET lista/detalle/catálogos; filtros; 400; 404; vacío; canal pending | S1 y cada cambio en mock | `node --test apps/web/tests/mock-api.test.mjs` |
| Componentes | SearchBar, FiltersPanel, Card, Details, Error | S2–S4 | Jest/Vitest + Testing Library según baseline |
| Contrato | Fixtures y respuestas del backend vs OpenAPI; tipos regenerados | Tras cambio de contrato | Test de schema + `tsc --noEmit` |
| E2E mock | Inicio → lista → buscar → filtrar → ficha → botón | S2–S3 | Playwright con mock Node corriendo |
| E2E escenarios negativos | Sin resultados, fallo 503, slug 404, fecha desconocida, canal no verificado | S3–S4 | Playwright + mock y casos de red |
| E2E integración | API NestJS, DB real de pruebas, datos revisados | Al integrar S3/S4 | Playwright desde web con `API_BASE_URL` real |
| Responsive/A11y | 360px, 768px, escritorio; teclado, labels y contraste | Cada cambio de UI/S4 | Playwright, inspección manual y auditoría WCAG |
| Build | No mocks en producción; root import correcto; sin errores de TS | Cada PR/S4 | `pnpm --filter @becas/web build` |

**Advertencia importante sobre Playwright:** si Next.js hace un `fetch` en un Server Component, `page.route()` en el navegador no sustituye esa llamada del lado servidor. Para E2E debe ejecutarse el proceso HTTP mock o API real con la variable `API_BASE_URL` correspondiente. `page.route()` sigue siendo útil para requests ejecutados desde el navegador.

### Ejemplo de caso E2E que debe escribirse (pseudocódigo)

```ts
test('estudiante busca, consulta y postula por canal verificado', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox').fill('ingenieria');
  await page.getByRole('button', { name: /buscar/i }).click();
  await expect(page).toHaveURL(/\/becas\?q=ingenieria/);
  await page.getByRole('link', { name: /beca ficticia para ingeniería/i }).click();
  await expect(page.getByText(/requisito ficticio/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /postular/i })).toHaveAttribute('href', 'https://example.org/postular-demo');
});
```

Los nombres exactos de controles se alinearán a la implementación; no pegar ese test sin adaptar semantic labels de los componentes. Otro test debe visitar `demo-medicina-por-confirmar` y verificar **ausencia de CTA de postulación**.

## 7. Integración con DEV 2 sin conflictos

1. **Inicio:** ambos revisan y aprueban `contracts/openapi.yaml` en PR bootstrap de DEV 2. DEV 1 desarrolla contra contrato congelado.
2. **Trabajo paralelo:** DEV 1 únicamente toca `apps/web/**` y `docs/frontend/**`, DEV 2 trabaja en API/worker/DB/infra. DEV 1 no debe instalar dependencia que modifique lockfile: solicita a DEV 2 que la declare.
3. **Cambio solicitado:** DEV 1 abre issue `API: falta campo ...`, describe historia, campos requeridos, ejemplo JSON y compatibilidad. DEV 2 actualiza OpenAPI y backend en PR; DEV 1 aprueba contrato y luego actualiza su cliente.
4. **Integración:** cambiar `API_BASE_URL` a backend de DEV 2 y ejecutar smoke/E2E real. Si falla, clasificar: contrato, bug API, bug frontend o datos de prueba. Corregir solo el módulo propio.
5. **Git:** rama desde `origin/develop` por historia, `feat/dev1/s2-MVP-004-search`. PR pequeño, merge squash, revisión cruzada. No escribir directamente en `main` ni `develop`.
6. **Ownership:** verificar `git diff --name-only origin/develop...HEAD`: solo paths propios. Si un merge genera conflicto fuera de `apps/web`, no resolver alterando código ajeno; notificar.
7. **Documentación:** cada PR actualiza `docs/frontend/progreso.md` (ID, estado, tests, capturas, contrato usado, bloqueos). No tocar el `docs/progreso.md` global, que consolida DEV 2.

### Comandos Git seguros

```bash
git fetch origin
git switch develop
git pull --ff-only origin develop
git switch -c feat/dev1/s2-MVP-004-search

# Editar solo apps/web/** y docs/frontend/**
git diff --name-only origin/develop...HEAD

pnpm --filter @becas/web lint
pnpm --filter @becas/web typecheck
pnpm --filter @becas/web build

git add apps/web docs/frontend
git commit -m "feat(web): MVP-004 búsqueda de becas"
git push -u origin feat/dev1/s2-MVP-004-search
```

Los comandos `lint`, `typecheck`, `build`, `test` y `test:e2e` suponen que DEV 2 los registró en el baseline; usar exactamente los scripts reales tras verificarlos. Nunca reportar pruebas como aprobadas sin ejecutarlas.

## 8. Definition of Ready, Definition of Done y reporte

### Ready (antes de comenzar una HU)

- [ ] Criterio de aceptación del backlog leído y dependencia identificada.
- [ ] Campo/ruta de API existe en OpenAPI o se usa mock del contrato firmado.
- [ ] Se conoce el estado UI esperado para loading, empty, error, null.
- [ ] La historia puede implementarse editando exclusivamente paths de DEV 1.

### Done de una historia frontend

- [ ] Componente/page funciona con mock y mantiene tipos, nullability y semántica API.
- [ ] Cumple todos los criterios frontend de la HU, sin inventar información.
- [ ] Pruebas unitarias/componentes pasan y E2E cuando cambió un recorrido.
- [ ] Responsive >=360px y controles básicos accesibles.
- [ ] Lint, typecheck y build pasan en entorno configurado.
- [ ] PR toca exclusivamente archivos permitidos, incluye capturas, resultados de tests y ticket ID.
- [ ] Para cierre integrado, E2E con NestJS real pasa o se documenta bloqueo externo (no marcar Done total si falta).

### Formato de `docs/frontend/progreso.md`

```md
| Fecha | ID | Fase | Estado | Archivos | Pruebas ejecutadas | Dependencia/API | PR |
|---|---|---|---|---|---|---|---|
| YYYY-MM-DD | MVP-004 | S2 | En revisión | apps/web/src/... | lint OK, test OK | OpenAPI v1 | #NN |
```

### Criterios finales de entrega DEV 1

- Un estudiante puede usar inicio, catálogo y ficha sin cuenta.
- Búsqueda y filtros funcionan juntos y dan resultados coherentes; se pueden limpiar; no hay pantalla vacía por error de red.
- Ficha muestra requisitos, documentos, beneficios, fechas y verificación o la ausencia explícita de datos.
- Estado OPEN/CLOSED/TO_CONFIRM se representa según API, sin lógica temporal inventada.
- Canal APPLY verificado habilita botón/correo; canal pendiente o de contacto no.
- URLs de detalles identifican la edición y tienen navegación estable.
- Pasan E2E con mock y con backend real en el gate correspondiente.
- La UI funciona en móvil y es navegable por teclado.
- Ningún archivo ajeno fue modificado; no existen fixtures DEMO publicadas en producción.

## 9. Referencias oficiales

- Next.js App Router: https://nextjs.org/docs/app
- Next.js fetching data: https://nextjs.org/docs/app/getting-started/fetching-data
- Next.js environment variables: https://nextjs.org/docs/app/guides/environment-variables
- openapi-typescript CLI: https://openapi-ts.dev/cli
- Playwright API mocking: https://playwright.dev/docs/mock
- MSW Node (alternativa para tests unitarios): https://mswjs.io/guides/integrations/node
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

## 10. Prompt listo para el agente DEV 1

```text
Actúa como desarrollador frontend senior del proyecto Centralizador Inteligente de Becas MVP.
Lee PLAN_DETALLADO_DESARROLLADOR_1.md, el Product Backlog MVP, el plan paralelo,
AGENTS.md y el contrato canónico contracts/openapi.yaml.

Tu propiedad exclusiva es apps/web/** y docs/frontend/**. Está prohibido editar
apps/api/**, apps/worker/**, contracts/**, packages/**, infra/**, pnpm-lock.yaml,
.github/** y archivos raíz compartidos. Si falta dependencia, configuración o
campo HTTP, documenta solicitud a DEV 2 y sigue con mocks contractuales.

Implementa exclusivamente historias P0 siguiendo S1 → S2 → S3 → S4, incluyendo
pruebas unitarias y Playwright cuando se afecte la experiencia de usuario.
Trabaja con la API simulada Node HTTP del kit (localhost:4010), usa el mismo
cliente tipado al cambiar a NestJS y nunca dupliques DTO ni reglas de dominio.

Al completar cada HU: ejecuta lint, typecheck, pruebas y build; registra resultados
reales en docs/frontend/progreso.md; crea rama feat/dev1/... basada en develop
y solicita PR revisado. Nunca inventes becas, datos oficiales ni enlaces.
```

**Este documento es un plan e incluye código de referencia, no una afirmación de que Next.js o el backend ya estén implementados.** El servidor mock de ejemplo fue probado de forma aislada con Node; la integración real se realizará cuando exista el monorepo y la API.
