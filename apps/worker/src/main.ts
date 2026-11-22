import { parseArgs } from "node:util";

function main() {
  const { values } = parseArgs({
    options: { health: { type: "boolean" }, help: { type: "boolean" } },
  });
  if (values.health) {
    console.log(JSON.stringify({ status: "ok" }));
    return;
  }
  console.log("Worker de becas. Use --health para verificar el proceso.");
}

try {
  main();
} catch {
  console.error("Argumentos inválidos. Consulte --help.");
  process.exitCode = 2;
}
