# Arquitectura backend

La API NestJS expone health y, desde TEC-04, catálogo, listado y detalle sobre PostgreSQL mediante Prisma. Los controladores validan parámetros y delegan consultas a servicios de lectura. El repositorio restringe la selección a PUBLISHED antes de paginar y contar. El detalle de una edición privada responde 404. La proyección pública conserva la nulabilidad y oculta el destino de cada canal salvo APPLY verificado con evidencia.

El worker se ejecuta en otro proceso. Consulta las políticas de acceso por fuente, resuelve y valida el destino, limita peticiones y procesa HTML con Crawlee/Cheerio o PDF con PyMuPDF. Un normalizador Zod entrega candidatos a la importación transaccional. La clave única de programa y edición preserva la identidad. Se asocian URL, fragmento o página y ejecución de ingesta a cada hecho.

La CLI interna conserva borradores, registra operador y transiciones y exige aprobación antes de publicar. Un cambio sustantivo abre nueva revisión. La vigencia se deriva con reloj inyectable, precisión y zona verificadas. Una fecha desconocida se conserva como nula. El pipeline y el flujo editorial corresponden a S1–S3. S0 entrega los puntos de arranque independientes.
