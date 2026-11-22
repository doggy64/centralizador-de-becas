const { spawnSync } = require("node:child_process");
const path = require("node:path");
function run(flag) {
  return spawnSync(
    process.execPath,
    [path.join(__dirname, "../dist/main.js"), flag],
    { encoding: "utf8" },
  );
}
test("health del worker independiente", () => {
  const result = run("--health");
  expect(result.status).toBe(0);
  expect(JSON.parse(result.stdout)).toEqual({ status: "ok" });
});
test("comando desconocido falla", () => {
  expect(run("--invalid").status).toBe(2);
});
