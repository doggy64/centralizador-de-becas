# Análisis inicial de DEV 2

El 22 de noviembre de 2026, main y la referencia local origin/develop apuntaban a d75ae91. El único archivo versionado en esa base era README.md. El kit y PLAN_DEV2 estaban presentes como entradas sin seguimiento. La rama remota de DEV 1 (cc9578f) contiene un mock HTTP, fixtures, pruebas y progreso del frontend. No hay aplicación servidor, migraciones, lockfile ni CI en la base de integración.

## Fuentes y alcance

El acuerdo de propiedad y Git del kit gobierna las interfaces. El libro Product Backlog contiene 32 historias, 15 habilitadores y criterios de salida. La matriz del kit asigna las siguientes contribuciones al servidor. Cada historia P0 requiere aceptación conjunta en el recorrido real.

| Historia | Prioridad | Fase | DEV 1 | DEV 2 |
|---|---|---|---|---|
| MVP-001 — Acceso sin registro | P0 | S1 | UI, componentes y pruebas web | Sin auth ni sesiones; API pública GET |
| MVP-002 — Inicio orientado a buscar becas | P0 | S1 | UI, componentes y pruebas web | Catálogos/health sin login |
| MVP-003 — Listado público de convocatorias | P0 | S2 | UI, componentes y pruebas web | GET list solo PUBLISHED |
| MVP-004 — Búsqueda por texto | P0 | S2 | UI, componentes y pruebas web | Búsqueda q y acentos |
| MVP-005 — Búsqueda sin coincidencias | P0 | S3 | UI, componentes y pruebas web | GET lista vacía meta.total=0 |
| MVP-006 — Navegación de resultados | P0 | S2 | UI, componentes y pruebas web | Paginación determinista y filtros |
| MVP-007 — Filtro por nivel académico | P0 | S2 | UI, componentes y pruebas web | level y catálogo |
| MVP-008 — Filtro por área de estudio | P0 | S2 | UI, componentes y pruebas web | area y multiarea |
| MVP-009 — Filtro por país de destino | P0 | S2 | UI, componentes y pruebas web | country destino |
| MVP-010 — Filtro por modalidad | P0 | S2 | UI, componentes y pruebas web | modality enum |
| MVP-011 — Filtro por cobertura | P0 | S2 | UI, componentes y pruebas web | coverage con evidencia |
| MVP-012 — Filtro por vigencia | P0 | S3 | UI, componentes y pruebas web | status temporal derivado |
| MVP-013 — Combinación y limpieza de filtros | P0 | S3 | UI, componentes y pruebas web | Filtros combinados y saneamiento |
| MVP-014 — Ordenamiento de convocatorias | P1 | P1 | UI, componentes y pruebas web | Orden estable opcional |
| MVP-015 — Ficha detallada de beca | P0 | S2 | UI, componentes y pruebas web | GET ficha por slug |
| MVP-016 — Requisitos de elegibilidad | P0 | S3 | UI, componentes y pruebas web | Requisitos con evidencia |
| MVP-017 — Documentación requerida | P0 | S3 | UI, componentes y pruebas web | Documentos con evidencia |
| MVP-018 — Beneficios y costos | P0 | S3 | UI, componentes y pruebas web | Beneficios/costos verificados |
| MVP-019 — Plazos de la convocatoria | P0 | S3 | UI, componentes y pruebas web | Fechas, precisión y zona |
| MVP-020 — Postulación mediante enlace oficial | P0 | S3 | UI, componentes y pruebas web | Canal APPLY URL verificado |
| MVP-021 — Postulación mediante correo institucional | P0 | S3 | UI, componentes y pruebas web | Canal APPLY EMAIL verificado |
| MVP-022 — Acceso a la convocatoria original | P0 | S3 | UI, componentes y pruebas web | URL fuente original |
| MVP-023 — Fecha de verificación y procedencia | P0 | S3 | UI, componentes y pruebas web | lastVerifiedAt y evidencia |
| MVP-024 — Distinguir programa y edición | P0 | S3 | UI, componentes y pruebas web | Program/Call + editionKey |
| MVP-025 — Estado de beca vencida | P0 | S3 | UI, componentes y pruebas web | CLOSED y vigencia |
| MVP-026 — Información incompleta identificada | P0 | S3 | UI, componentes y pruebas web | Campos null / incompletos |
| MVP-027 — Resultados sin duplicados | P0 | S3 | UI, componentes y pruebas web | Deduplicación por edición |
| MVP-028 — Aviso de información incorrecta | P1 | P1 | UI, componentes y pruebas web | Recepción de incidencias opcional, backend coordinado |
| MVP-029 — Diseño móvil y adaptable | P0 | S4 | UI, componentes y pruebas web | Respuestas de API estables en móvil |
| MVP-030 — Accesibilidad básica | P0 | S4 | UI, componentes y pruebas web | Errores y semántica accesible |
| MVP-031 — Compartir una beca | P1 | P1 | UI, componentes y pruebas web | URL canónica por edición |
| MVP-032 — Estados de carga y errores | P0 | S2/S4 | UI, componentes y pruebas web | Errores HTTP y loading coherente |

## Integración pendiente

Los archivos YAML y las tres fixtures coinciden entre ambos directorios. El mock utiliza los mismos cuatro GET y el puerto 4010 para pruebas. El contrato propone 3001 para la API. OpenAPI 3.0.3 declara nullable en tres enums pero sus listas omiten null. NullableEvidence combina nullable con allOf y hereda un objeto obligatorio. Las fixtures de lista y detalle usan precisamente esos nulos. DEV 1 debe revisar una corrección de esquema que preserve los cuerpos existentes. La multiselección de área necesita un acuerdo sobre serialización de query; v1 define valores individuales.

El kit exige revisión y una base S0 común antes de crear ramas funcionales. S1 depende de BOOT. La publicación remota y el merge requieren autorización. El piloto propone 15 convocatorias de 3–5 fuentes revisadas, sujetas a evidencia y revisión humana.
