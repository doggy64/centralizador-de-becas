const request = require("supertest");
const { createApp } = require("../dist/app");
let app;
beforeAll(async () => {
  app = await createApp();
  await app.init();
});
afterAll(async () => {
  await app.close();
});
test("health público", async () => {
  await request(app.getHttpServer())
    .get("/health")
    .expect(200, { status: "ok" });
});
test("ruta desconocida devuelve el error acordado", async () => {
  await request(app.getHttpServer())
    .get("/inexistente")
    .expect(404, {
      error: { code: "NOT_FOUND", message: "Recurso no disponible" },
    });
});
test("headers, CORS y límite de solicitudes", async () => {
  const server = request(app.getHttpServer());
  const ok = await server
    .get("/health")
    .set("Origin", "http://localhost:3000")
    .expect(200);
  expect(ok.headers["access-control-allow-origin"]).toBe(
    "http://localhost:3000",
  );
  expect(ok.headers["x-content-type-options"]).toBe("nosniff");
  const outside = await server
    .get("/health")
    .set("Origin", "https://example.org")
    .expect(200);
  expect(outside.headers["access-control-allow-origin"]).toBeUndefined();
  for (let i = 0; i < 120; i++) await server.get("/health");
  await server.get("/health").expect(429, {
    error: { code: "RATE_LIMIT", message: "Demasiadas solicitudes" },
  });
});
