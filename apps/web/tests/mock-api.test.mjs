/** Prueba del ejemplo de API mock, sin Next/NestJS. Ejecutar: node --test apps/web/tests/mock-api.test.mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const port = 49123;
const base = `http://127.0.0.1:${port}`;
const script = new URL('../scripts/mock-api.mjs', import.meta.url);

async function waitForHealth() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`${base}/health`);
      if (r.ok) return;
    } catch { /* server starting */ }
    await sleep(50);
  }
  throw new Error('La API de prueba no arrancó');
}

test('mock API cumple el flujo esencial y controla errores', async () => {
  const processMock = spawn(process.execPath, [fileURLToPath(script)], {
    env: { ...process.env, MOCK_API_PORT: String(port) }, stdio: 'ignore',
  });
  try {
    await waitForHealth();

    const response = await fetch(`${base}/api/v1/scholarships?q=ingenieria&level=MASTER&country=BO`);
    assert.equal(response.status, 200);
    const listing = await response.json();
    assert.equal(listing.meta.total, 1);
    assert.equal(listing.data[0].slug, 'demo-ingenieria-2027');
    assert.equal(listing.data[0].temporalStatus, 'OPEN');

    const detailResponse = await fetch(`${base}/api/v1/scholarships/demo-ingenieria-2027`);
    const detail = await detailResponse.json();
    assert.equal(detail.applicationChannels[0].purpose, 'APPLY');
    assert.equal(detail.applicationChannels[0].verificationStatus, 'VERIFIED');
    assert.ok(detail.sourceOriginalUrl);

    const uncertain = await (await fetch(`${base}/api/v1/scholarships/demo-medicina-por-confirmar`)).json();
    assert.equal(uncertain.temporalStatus, 'TO_CONFIRM');
    assert.equal(uncertain.applicationChannels[0].urlOrEmail, null);

    const empty = await (await fetch(`${base}/api/v1/scholarships?q=tema-inexistente`)).json();
    assert.equal(empty.meta.total, 0);
    assert.deepEqual(empty.data, []);

    assert.equal((await fetch(`${base}/api/v1/scholarships?limit=500`)).status, 400);
    assert.equal((await fetch(`${base}/api/v1/scholarships/no-existe`)).status, 404);
    assert.equal((await fetch(`${base}/api/v1/catalogs/filters`)).status, 200);
  } finally {
    processMock.kill('SIGTERM');
  }
});
