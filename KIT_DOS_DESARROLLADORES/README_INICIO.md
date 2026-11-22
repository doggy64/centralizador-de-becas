# Kit de división para dos desarrolladores / agentes

Este kit es un **plan de ejecución**, no un repositorio con la aplicación implementada.

## Lectura en orden
1. `00_PLAN_PARALELO.md` — arquitectura, límites de propiedad, fases y gates.
2. `AGENTS.md` — reglas comunes para ambos agentes.
3. `03_GIT_Y_COORDINACION.md` — ramas, PR, integraciones y comandos.
4. `01_INSTRUCCIONES_DEV1.md` o `02_INSTRUCCIONES_DEV2.md` según rol.
5. `contracts/openapi.yaml` y fixtures — contrato HTTP propuesto para aprobación en baseline.
6. `04_MATRIZ_RESPONSABILIDADES.csv`, `05_MATRIZ_TECNICOS.csv`, `06_TRAZABILIDAD.md`.
7. Referencias originales: `PLAN_MAESTRO_DESARROLLO_MVP_BECAS.md` y `Product_Backlog_MVP_Estudiantes_Becas.xlsx`.

## Inicio exacto

**DEV 2:** crea una rama `chore/bootstrap-contract`, prepara monorepo, contratos y scripts, PR a `develop`.  
**DEV 1:** revisa/acepta contrato. Tras merge, crea su rama desde `develop` y empieza home/listado con mocks.  
**DEV 2:** inicia modelo/ingestión en rama independiente desde el mismo `develop`.

El contrato adjunto debe confirmarse/ajustarse en ese PR inicial; los archivos son propuestas, no API ya desplegada.

## Protección automática
Mover `scripts/check_ownership.py` al proyecto y ejecutarlo en CI en PRs con `GITHUB_HEAD_REF` y base `origin/develop`. No usar como sustituto de revisión: los PR release/bootstrap requieren comprobación manual. La plantilla `docs/CODEOWNERS.template` puede instalarse después de reemplazar los handles.

## Reglas de publicación
La interfaz es exclusivamente para estudiantes sin cuenta. El backend expone solo convocatorias aprobadas con fuente y fechas trazables; botones APPLY únicamente con canal VERIFIED. Scraping de fuentes públicas autorizadas y verificación humana obligatoria. Jamás sembrar en producción fixtures sintéticas del kit.

## Qué contiene el ZIP
Todos los documentos divididos, contratos y fixtures de prueba, matriz y documentos originales de referencia. **No incluye código de aplicación terminado.**
