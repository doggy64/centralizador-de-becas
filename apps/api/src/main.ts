import { createApp } from "./app";

async function main() {
  if (process.env.API_DATABASE_URL)
    process.env.DATABASE_URL = process.env.API_DATABASE_URL;
  const port = Number(process.env.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT inválido");
  const app = await createApp();
  const host = process.env.HOST ?? (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
  await app.listen(port, host);
}

main().catch(() => {
  console.error(
    "No se pudo iniciar la API. Revise PORT y la disponibilidad del puerto.",
  );
  process.exitCode = 1;
});
