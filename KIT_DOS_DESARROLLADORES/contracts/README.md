# Contrato HTTP v1 (borrador congelable en bootstrap)

`openapi.yaml` es un **punto de partida para que ambos agentes lo revisen y firmen en el PR bootstrap**. No es la API ya implementada. Una vez aprobado, cualquier cambio se hace primero en una rama de DEV 2 con revisión de DEV 1.

- No agregar endpoints POST/PUT/PATCH públicos de ingesta, aprobación o administración.
- `GET /api/v1/scholarships` solo devuelve PUBLISHED; no confundir status temporal y publicación editorial.
- `GET /api/v1/scholarships/{slug}` da 404 tanto para slug inexistente como no publicado.
- Fechas incompletas: `deadline=null`, conservar `originalDeadlineText`, temporalStatus `TO_CONFIRM` si no se puede calcular.
- Canales no verificados o de propósito CONTACT: `urlOrEmail=null` en respuesta pública.
- Estas fixtures son **sintéticas** para desarrollo y test, nunca semillas de producción ni "becas reales".
- La versión 1.0.0 es contractual entre los dos equipos; revisión inicial antes de escribir lógica dependiente.
- OpenAPI define forma de datos y errores; la política semántica completa sigue en el plan maestro.

**Nota de precisión temporal:** en este contrato `dates.deadline` representa un instante con zona comprobable; para fecha sin hora no se crea un instante artificial. La API puede calcular estados de fecha solo cuando política de precisión y evidencia lo permitan, sin asumir horas/zona no publicadas.
