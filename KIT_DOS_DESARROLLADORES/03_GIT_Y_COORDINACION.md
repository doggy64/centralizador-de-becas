# GIT Y COORDINACIÓN — REGLAS ANTICONFLICTOS PARA 2 DESARROLLADORES

## 0. Convenciones
Ramas: `main` estable; `develop` integración; `feat/dev1/Sx-MVP-NNN-descripcion` para frontend; `feat/dev2/Sx-TEC-NN-descripcion` para backend; `fix/dev1/...`, `fix/dev2/...`; `release/mvp-1.0.0`. Usar minúsculas si la convención del repo lo exige; conservar prefijo único por dev.

No usar una sola rama `frontend` y otra `backend` para todas las fases: generan cambios enormes e integración tardía. Usar PR pequeños por historia o conjunto cohesivo y squash merge.

## 1. Configuración inicial hecha por DEV 2 y revisada por DEV 1

```bash
git switch main
git pull --ff-only origin main
git switch -c develop
git push -u origin develop
# En el hosting, proteger main y develop:
# - rechazar push directo, requerir PR, CI verde, revisión del otro dev
# - bloquear merge si la rama está desactualizada o cambia paths ajenos
# - prohibir force push y borrado de ramas protegidas
```

Crear un PR de bootstrap/contrato antes de comenzar S1. Tras aprobarlo ambos hacen fetch y trabajan desde el mismo SHA/`develop` actualizado.

## 2. Inicio de una tarea aislada

**DEV 1:**
```bash
git fetch origin
git switch develop
git pull --ff-only origin develop
git switch -c feat/dev1/s2-MVP-004-search
# Editar exclusivamente apps/web/** y docs/frontend/**
pnpm --filter @becas/web lint
pnpm --filter @becas/web typecheck
pnpm --filter @becas/web build
git add apps/web docs/frontend
git commit -m "feat(web): MVP-004 buscar becas"
git push -u origin feat/dev1/s2-MVP-004-search
```

**DEV 2:**
```bash
git fetch origin
git switch develop
git pull --ff-only origin develop
git switch -c feat/dev2/s2-TEC-04-api-read
# Editar apps/api/** y/o paths que posee DEV 2
pnpm --filter @becas/api lint
pnpm --filter @becas/api typecheck
pnpm --filter @becas/api test
git add apps/api
git commit -m "feat(api): TEC-04 consultas de becas publicadas"
git push -u origin feat/dev2/s2-TEC-04-api-read
```

Estos comandos presuponen que los scripts fueron creados durante el bootstrap. Ajustar nombres únicamente en la primera ADR, no en cada rama.

## 3. Pull requests y revisión cruzada

**Título:** `[DEV1][MVP-004] Búsqueda por texto` o `[DEV2][TEC-04] API catálogo`.  
**Descripción mínima:** propósito, historia/TEC, archivos, contrato afectado SÍ/NO, checklist de pruebas, evidencia (capturas para UI), riesgos y dependencias.  
**Revisión:** DEV 2 revisa PR de DEV 1; DEV 1 revisa PR de DEV 2, aunque no edita su módulo. El autor no autoaprueba su PR.  
**Merge:** squash merge a `develop`; auto-delete feature branch tras merge; si hay cambios de API/contrato, merge de contrato antes del consumo FE.

## 4. Sincronización y conflictos de merge

```bash
git fetch origin
git switch feat/dev1/s2-MVP-004-search
git merge origin/develop
# resolver solo archivos propios si hubo conflictos
pnpm --filter @becas/web typecheck
git push
```

Preferir merge de `origin/develop` para sincronizar rama compartida entre miembros; rebase solo sobre rama personal y con política acordada. Nunca `git push --force` en branches compartidas; `--force-with-lease` solamente para rama personal tras rebase intencional.

**Si hay conflicto en un archivo de otro dueño:** detener; abrir issue/coordinar PR del dueño. No resolver editándolo sin permiso. Si aparece conflicto en lockfile, su propietario es DEV 2. No borrar locks para "solucionarlo".

## 5. Trabajo simultáneo en la misma máquina con worktrees (opcional)

```bash
git fetch origin
git worktree add ../becas-dev1 -b feat/dev1/s1-MVP-002-home origin/develop
git worktree add ../becas-dev2 -b feat/dev2/s1-TEC-02-model origin/develop
```

Cada worktree tiene `node_modules`, `.env.local` y proceso de desarrollo por separado. Si comparten DB local, usar bases de desarrollo separadas; DB de integración se siembra y controla por DEV 2. Nunca correr migraciones de desarrollo desde DEV 1. Usar puertos distintos cuando sea necesario.

## 6. Cambios en el contrato

1. DEV 1 detecta campo/end-point faltante: crea issue con caso de uso, schema esperado y ejemplo; sigue usando el contrato vigente.
2. DEV 2 propone un PR pequeño que modifica `contracts/openapi.yaml`, fixtures, DTOs y pruebas de compatibilidad; señala si el cambio es compatible.
3. DEV 1 revisa y aprueba el contrato; merge a `develop`.
4. DEV 1 actualiza dentro de `apps/web/**` el cliente generado y tests desde el nuevo contrato en un PR propio.
5. Integración valida consumer + provider + E2E real. No "romper" cliente web unilateralmente.

Una deprecación se mantiene mientras el frontend desplegado dependa de ella; el protocolo no exige implementar `/api/v2` si el cambio es compatible y no hay otro cliente en producción.

## 7. Versionado y orden de merges

- PR independientes de DEV 1 (UI con mock) y DEV 2 (API) se pueden mergear en cualquier orden si contrato estable y tests aislados pasan.
- Si DEV 1 necesita un campo de la API, merge primero PR de DEV 2 que lo introduce; después PR de DEV 1 que lo consume.
- Una migración de BD y cambio de DTO en backend deben tener rollout compatible con entorno donde se despliega; revisar antes de merge.
- DEV 2 integra CI y despliegues; DEV 1 aporta el comando y test E2E en su propio directorio. `develop` se despliega a staging para validación cruzada.

## 8. Reunión breve de sincronización (sin reuniones extensas)

Antes de crear nuevos tickets: cada dev comunica **hecho / siguiente / bloqueado / cambio de contrato**. Lo documentan en su `docs/{frontend,backend}/progreso.md`. El gate de fase se revisa sobre `develop`, no sobre ramas aisladas.

## 9. Comprobaciones automáticas recomendadas

- `git diff --name-only origin/develop...HEAD` — listar rutas tocadas y rechazar rutas ajenas.
- CI: frozen lockfile, lint, typecheck, unit, integration (Postgres efímero), build y E2E reales en rama de integración.
- Validación de especificación OpenAPI, fixture vs schema, backend vs schema y cliente frontend tipado.
- CODEOWNERS opcional cuando se conozcan los usuarios de GitHub. Se incluye plantilla de reglas de ruta, sin inventar handles.
- Ningún PR mezcla migración DB, rediseño UX y cambio de scraping salvo cambio de contrato claramente secuenciado.

## 10. Qué hacer cuando un desarrollador termina antes

- DEV 1: ampliar tests E2E y accesibilidad, corregir responsive y estados con mocks, revisar PRs backend y documentar incidencias; **no entrar al worker/api**.
- DEV 2: reforzar fixtures, deduplicación, tests, detección de errores y runbooks; **no entrar a web**.
- Ante bloqueos críticos entre equipos, revisar contrato y ajustar planificación; no duplicar servicios ni saltar las reglas.
