import { createApp } from "./app";

async function main() {
  const port = Number(process.env.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT inválido");
  const app = await createApp();
  await app.listen(port);
}

main().catch(() => {
  console.error(
    "No se pudo iniciar la API. Revise PORT y la disponibilidad del puerto.",
  );
  process.exitCode = 1;
});
