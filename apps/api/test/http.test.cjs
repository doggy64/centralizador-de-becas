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
