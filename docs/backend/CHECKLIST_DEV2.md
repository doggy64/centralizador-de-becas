# Checklist DEV 2
- [x] S0 BOOT — Bootstrap + contrato
- [x] S1 TEC-02 — Modelo relacional
- [x] S1 TEC-01 — Catálogo fuentes
- [x] S1 TEC-03 — Importación editorial
- [x] S2 TEC-04 — API pública GET
- [x] S2 TEC-05 — Extractor HTML
- [x] S2 TEC-06 — Extractor PDF
- [x] S2 TEC-07 — Normalización y evidencias
- [x] S3 TEC-10 — Temporalidad y deduplicación
- [x] S3 TEC-11 — Canales oficiales
- [x] S3 TEC-09 — Workflow editorial completo
- [x] S4 TEC-12 — Seguridad
- [x] S4 TEC-13 — QA integración
- [x] S4 TEC-14 — Despliegue y backup
- [x] S4 TEC-15 — Runbook operaciones
- [ ] P1 TEC-08 — Extracción IA asistida (opcional)

## Evidencia parcial de BOOT

- [x] Instalación congelada, compilación, lint, tipos y formato en los dos paquetes.
- [x] Dos pruebas HTTP de la API y dos pruebas de proceso del worker.
- [x] Tres fixtures contrastadas con la propuesta de contrato local.
- [x] PostgreSQL 17 nativo arrancó y procesó una consulta en aislamiento.
- [ ] Ejecutar Docker Compose y comprobar la CI remota cuando exista un motor de contenedores.
- [ ] DEV 1 revisa el contrato y el equipo integra la base compartida en develop.

La evidencia por comando está en progreso.md. Las historias P0 siguen abiertas hasta la aceptación integrada.
