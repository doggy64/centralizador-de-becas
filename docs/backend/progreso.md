# Avance de DEV 2

## S0 · BOOT · 22 de noviembre de 2026

Rama local chore/bootstrap-contract desde origin/develop en d75ae91. Se preparó el workspace con el servidor de salud NestJS, respuesta de error común, proceso CLI del worker, PostgreSQL para desarrollo y pruebas, CI preliminar, validador de fixtures y propuesta de nulabilidad. Los criterios y secuencia por habilitador están en PLAN_EJECUCION_DEV2.md.

| Comprobación ejecutada | Resultado |
|---|---|
| pnpm install --frozen-lockfile | Lockfile válido en los tres proyectos |
| pnpm -r lint y pnpm -r typecheck | Ambos paquetes pasaron |
| pnpm -r test | Compilación de ambos paquetes y cuatro pruebas aprobadas. Supertest cubrió health y 404. El worker respondió a health y rechazó un argumento desconocido |
| pnpm format:check | Formato válido |
| node contracts/validate.cjs | El original falló en lista y detalle. La propuesta local pasó las tres fixtures |
| initdb, pg_ctl, psql | PostgreSQL 17.11 aceptó una consulta en un clúster temporal aislado y se detuvo correctamente |

Docker CLI no estaba disponible. La verificación con Compose y la ejecución del workflow en GitHub siguen pendientes. La prueba de PostgreSQL utilizó los binarios nativos. Las pruebas HTTP de S0 cubren disponibilidad del proceso. La integración con persistencia llegará con TEC-02 y TEC-04.

La revisión obligatoria de DEV 1, el PR y la integración de BOOT en develop siguen pendientes. La regla de coordinación del kit exige esa base antes de abrir la primera rama funcional TEC-02. El usuario ha reservado la publicación y el merge. No se ha desplegado ningún servicio.

Prueba de arranque adicional: el proceso compilado respondió HTTP 200 con status ok en loopback y se cerró. El ejecutable del worker también devolvió status ok.

## S1–S4 · Entrega acumulativa

La punta de trabajo incorpora el modelo Prisma y dos migraciones PostgreSQL, catálogos y fuentes institucionales, importación transaccional con modo de simulación, normalización Zod, evidencia por atributo, historial editorial y publicación auditada. La API ofrece los cuatro GET contractuales y expone únicamente ediciones PUBLISHED cuyos orígenes permanecen aprobados.

El worker procesa HTML con Crawlee y Cheerio, PDFs digitales con PyMuPDF, límites de tamaño y tiempo, robots, allowlist, DNS de destinos públicos, redirecciones y registros de ingesta. Los PDF sin texto terminan en NEEDS_REVIEW. Los canales APPLY requieren evidencia, verificación y frescura antes de exponer un destino.

La suite ejecutada al cierre cubrió build, lint, tipos, pruebas unitarias HTTP, extracción y temporalidad, 14 pruebas del worker, tres recorridos de integración PostgreSQL con Supertest y las fixtures OpenAPI. La base temporal también aplicó ambas migraciones, realizó carga idempotente de 15 candidatos de tres fuentes y restauró un backup en una base distinta con conteos coincidentes. La prueba adicional de correo quedó implementada, pero su reejecución final encontró el clúster temporal apagado. El sandbox no pudo reiniciarlo al agotarse la revisión automática de escalamiento. No había Docker ni WSL instalados, por lo que Compose y GitHub Actions quedan definidos pero no ejecutados localmente.
