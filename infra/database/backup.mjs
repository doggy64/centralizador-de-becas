import { spawnSync } from "node:child_process";
import { openSync, closeSync, unlinkSync } from "node:fs";
import path from "node:path";

const [mode, requested] = process.argv.slice(2);
const file =
  requested ??
  (mode === "backup" && process.env.BACKUP_DIR
    ? path.join(
        process.env.BACKUP_DIR,
        "becas-" + new Date().toISOString().replace(/[:.]/g, "-") + ".dump",
      )
    : undefined);
if (!file || !["backup", "restore"].includes(mode))
  throw Error("Uso: backup.mjs backup|restore ARCHIVO");
const url = new URL(
  (mode === "backup"
    ? process.env.DATABASE_URL
    : process.env.RESTORE_DATABASE_URL) ?? "",
);
if (!["postgres:", "postgresql:"].includes(url.protocol))
  throw Error("Se requiere una URI PostgreSQL");
const database = decodeURIComponent(url.pathname.slice(1));
const env = {
  ...process.env,
  PGHOST: url.hostname,
  PGPORT: url.port || "5432",
  PGUSER: decodeURIComponent(url.username),
  PGPASSWORD: decodeURIComponent(url.password),
  PGDATABASE: database,
  PGCONNECT_TIMEOUT: "10",
};
if (url.searchParams.has("sslmode"))
  env.PGSSLMODE = url.searchParams.get("sslmode");
function pg(program, args, output) {
  const binary = process.env.PG_BIN
    ? path.join(process.env.PG_BIN, program)
    : program;
  const r = spawnSync(binary, args, {
    env,
    stdio: ["ignore", output ?? "pipe", "inherit"],
    encoding: "utf8",
    windowsHide: true,
  });
  if (r.error || r.status !== 0) throw Error("Falló " + program);
  return r.stdout?.trim();
}
if (mode === "backup") {
  const fd = openSync(file, "wx", 0o600);
  try {
    pg("pg_dump", ["--format=custom", "--no-owner", "--no-acl"], fd);
  } catch (err) {
    closeSync(fd);
    unlinkSync(file);
    throw err;
  }
  closeSync(fd);
} else {
  if (!database.endsWith("_restore"))
    throw Error("El destino de recuperación debe ser una base nueva *_restore");
  if (
    pg("psql", [
      "-XAt",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      "SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND n.nspname NOT LIKE 'pg_toast%'",
    ]) !== "0"
  )
    throw Error("La base de recuperación contiene objetos");
  pg("pg_restore", [
    "--single-transaction",
    "--no-owner",
    "--no-acl",
    "--dbname",
    database,
    file,
  ]);
}
console.log(mode + " OK");
