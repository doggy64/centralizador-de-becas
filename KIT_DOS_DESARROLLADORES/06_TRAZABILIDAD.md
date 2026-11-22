# MATRIZ DE HISTORIAS — PROPIEDAD SEPARADA

Una historia puede requerir UI y API, pero **no un archivo compartido**. DEV 1 es dueño del código de presentación; DEV 2 es dueño de persistencia, dominio, HTTP y extracción. La historia se cierra solo después de su prueba integrada.

| Historia | Prioridad | Fase | DEV 1 — Web | DEV 2 — API / Datos |
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

## Habilitadores técnicos

| TEC | Fase | Dueño | Trabajo |
|---|---|---|---|
| TEC-01 | S1 | DEV 2 | Fuentes institucionales (P0, S1)  |
| TEC-02 | S1 | DEV 2 | Modelo relacional (P0, S1)  |
| TEC-03 | S1 | DEV 2 | Carga editorial inicial (P0, S1)  |
| TEC-04 | S2 | DEV 2 | API pública de lectura (P0, S2)  |
| TEC-05 | S2 | DEV 2 | Extractor HTML inicial (P0, S2)  |
| TEC-06 | S2 | DEV 2 | Extractor PDF (P0, S2)  |
| TEC-07 | S2 | DEV 2 | Estructura y evidencias (P0, S2)  |
| TEC-08 | P1 | DEV 2 | IA asistida opcional (P1, S3) (P1 opcional) |
| TEC-09 | S3 | DEV 2 | Verificación editorial (P0, S3)  |
| TEC-10 | S3 | DEV 2 | Vigencia y deduplicación (P0, S3)  |
| TEC-11 | S3 | DEV 2 | Revisión de enlaces (P0, S3)  |
| TEC-12 | S4 | DEV 2 | Seguridad y privacidad (P0, S4)  |
| TEC-13 | S4 | DEV 2 | QA funcional y E2E (P0, S4)  |
| TEC-14 | S4 | DEV 2 | Despliegue y respaldo (P0, S4)  |
| TEC-15 | S4 | DEV 2 | Guía operativa de publicación (P0, S4)  |

**Criterio de salida:** no marcar una historia P0 "Done" por tener solo la interfaz o solo el endpoint; requiere el recorrido E2E real y validación de los criterios originales.