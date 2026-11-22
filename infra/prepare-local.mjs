import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
const api = createRequire(new URL("../apps/api/package.json", import.meta.url));
const url = process.env.TEST_DATABASE_URL;
if (
  process.env.NODE_ENV === "production" ||
  !url ||
  !new URL(url).pathname.endsWith("_test") ||
  !["localhost", "127.0.0.1", "db-test"].includes(new URL(url).hostname)
)
  throw Error("Se requiere TEST_DATABASE_URL local con base *_test");
process.env.DATABASE_URL = url;
process.env.API_DATABASE_URL = url;
process.env.WORKER_DATABASE_URL = url;
function run(args) {
  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
if (process.argv[2] === "start") await import("../apps/api/dist/main.js");
else {
  run([
    api.resolve("prisma/build/index.js"),
    "migrate",
    "deploy",
    "--schema",
    "apps/api/prisma/schema.prisma",
  ]);
  run(["apps/api/prisma/seed.cjs"]);
  run(["apps/worker/test/prepare-demo.cjs"]);
}
