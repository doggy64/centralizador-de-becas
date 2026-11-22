# AGENTE / DESARROLLADOR 1 — FRONTEND Y EXPERIENCIA DEL ESTUDIANTE

## Misión
Implementar el cliente público Next.js del MVP: sin registro, experiencia móvil, búsqueda, filtros, fichas, estado temporal y postulación mediante enlace/correo oficial. **No implementar lógica de scraping, ORM, backend, colas ni reglas de publicación.**

## Propiedad de código, sin excepciones
**Puede editar:** `apps/web/**`, `docs/frontend/**`. **Solo puede leer:** `apps/api/**`, `apps/worker/**`, `contracts/**`, `packages/**`, `infra/**`, root, `.github/**`, lockfile. Solicitudes de cambios a contrato/dependencias las hace mediante issue/PR de solo documentación de su propiedad; DEV 2 aplica cambios compartidos.

## Stack
Next.js App Router, TypeScript strict, Tailwind/shadcn accesible, `fetch` o cliente generado desde OpenAPI (sin inventar rutas); Playwright E2E dentro de `apps/web/`, test unitario con herramientas existentes. No agregar librerías nuevas al root. Nombres sugeridos de paquetes: `@becas/web`.

## Diseño de módulos
```
apps/web/src/
  app/page.tsx
  app/becas/page.tsx
  app/becas/[slug]/page.tsx
  app/loading.tsx
  app/error.tsx
  app/not-found.tsx
  components/layout/**
  components/search/**
  components/filters/**
  components/scholarship/**
  lib/api/**                 # fetch tipado, errores/DTOs
  lib/query-params/**
  lib/format/**
  lib/mocks/**               # mocks de desarrollo, nunca publicación
apps/web/tests/e2e/**
docs/frontend/progreso.md
```

## Fases independientes

### S1 — `MVP-001`, `MVP-002`
- Crear home pública con mensaje, búsqueda, CTA a `/becas`, encabezado, footer y navegación por teclado.
- Configurar cliente API de una sola capa; separar modo mock de modo real con variable solo de desarrollo/test; nunca mocks habilitados en staging o producción.
- Tipar desde `contracts/openapi.yaml`; usar fixtures contractuales. Definir visual de estados `OPEN`, `UPCOMING`, `CLOSED`, `TO_CONFIRM`, pero **no recalcular estado en UI**.
- Tests de navegación sin login y componentes básicos. **Entrega:** demo del home y rutas iniciales sin API real.

### S2 — `MVP-003`, `004`, `006`, `007`, `008`, `009`, `010`, `011`, `015`, primera parte de `032`
- Cards con `title`, institución, nivel, destino, fecha confirmada y URL de detalle.
- `/becas` con búsqueda por término, filtros por nivel, área, país de destino, modalidad y cobertura; selectores accesibles, sincronizados con URL y navegación/paginación.
- `/becas/[slug]` con campos generales, datos ausentes marcados "No especificado"; 404 por slug inexistente; skeleton/errores recuperables.
- No duplicar reglas de filtrado ni ordenar en cliente si API ya responde filtrado. Soportar loading/error/empty; el empty completo queda S3.
- Tests UI con fixtures. **Gate:** demo contra mocks y E2E contra API real cuando DEV 2 publique GET.

### S3 — `MVP-005`, `012`, `013`, `016`–`027`
- Combinar filtros y chips activos con `Limpiar filtros`, persistir en query string; renderizar estados sin coincidencias.
- Ficha: requisitos, documentos, beneficios, costos, apertura/cierre precisos, programa/edición, fuente original, evidencias, `lastVerifiedAt`, faltantes y estado vencido.
- Renderizar aplicación **solo** cuando `applicationChannel.purpose === 'APPLY'` y `verificationStatus === 'VERIFIED'`; para URL externa `<a target="_blank" rel="noopener noreferrer">`, para correo `mailto:` (valor provisto y validado por backend), nunca construir correo o link desde texto del PDF.
- Si canal no está confirmado, mostrar aviso y **no** botón activo. Datos desconocidos no se presentan como hechos.
- Probar camino completo, primero con fixture de canal verificado y otro no verificado, después E2E real.

### S4 — `MVP-029`, `030`, consolidación `032`
- Mobile desde 360px, lectores de pantalla, teclado, foco, contraste, responsive filtros, errores, estados vacíos, 404, SEO correcto y botones de postulación.
- Tests Playwright E2E en un entorno conjunto usando backend + DB seeded: sin cuenta → buscar → filtrar → ficha → enlace oficial; sin resultados; fecha desconocida; link sin verificar; edición; móvil.
- No editar scripts CI raíz: DEV 2 integra el comando de tests web informado por DEV 1.

### Opcionales P1 (únicamente con P0 terminado)
`MVP-014` ordenar, `MVP-028` reporte de información incorrecta (no crear backend por su cuenta), `MVP-031` compartir enlace.

## Criterios especiales
- Entender `source` / `evidence` como procedencia. No interpretar falta de deadline como OPEN.
- Catálogos/niveles vienen de API. No fabricar nombres de instituciones o registros de becas visibles en producción.
- El `slug` identifica la **edición de la convocatoria**, no solo el programa.
- Paginación conserva filtros; una página inválida o sin resultados se maneja según error API.
- Campos `null` y arrays vacíos deben mostrar "No especificado" de manera coherente.
- No confiar en URL de aplicación sin verificación de backend.

## Pruebas mínimas antes de PR
1. `pnpm --filter @becas/web lint`
2. `pnpm --filter @becas/web typecheck`
3. `pnpm --filter @becas/web test` (si script está definido)
4. `pnpm --filter @becas/web build`
5. `pnpm --filter @becas/web test:e2e` contra mocks para PR de UI; contra API real en gate integrado.

Si hay scripts distintos, documentarlos; no afirmar que pasaron sin ejecutarlos. En cada PR: screenshots móvil/desktop, test y story IDs, cambios solo en tus rutas, y actualizar `docs/frontend/progreso.md`.

## Prompt listo para agente DEV 1
> Actúa exclusivamente como desarrollador frontend del MVP de becas. Lee `00_PLAN_PARALELO.md`, `01_INSTRUCCIONES_DEV1.md`, `03_GIT_Y_COORDINACION.md`, `contracts/openapi.yaml` y el plan maestro original. Solo edita `apps/web/**` y `docs/frontend/**`. Implementa la siguiente historia P0 asignada de la fase actual con pruebas; usa fixtures contractuales si la API todavía no está lista. No cambies Prisma, NestJS, worker, paquetes compartidos, lockfile ni root. Entrega PR pequeño, lista de pruebas y problemas de integración; nunca modifiques un módulo de DEV 2 para desbloquearte.
