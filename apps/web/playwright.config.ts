import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';

const host = '127.0.0.1';
const apiPort = 49125;
const webPort = 49126;
const realApiBaseUrl = process.env.E2E_API_BASE_URL;
const webServer: NonNullable<PlaywrightTestConfig['webServer']> = realApiBaseUrl
  ? [{
      command: `node node_modules/next/dist/bin/next dev --webpack -H ${host} -p ${webPort}`,
      url: `http://${host}:${webPort}`,
      timeout: 120000,
      env: { API_BASE_URL: realApiBaseUrl }
    }]
  : [
      { command: 'node scripts/mock-api.mjs', url: `http://${host}:${apiPort}/health`, env: { MOCK_API_PORT: String(apiPort) } },
      { command: `node node_modules/next/dist/bin/next dev --webpack -H ${host} -p ${webPort}`,
        url: `http://${host}:${webPort}`, timeout: 120000, env: { API_BASE_URL: `http://${host}:${apiPort}` } }
    ];

export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  expect: { timeout: 15000 },
  use: { baseURL: `http://${host}:${webPort}`, channel: process.env.PLAYWRIGHT_CHANNEL },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { viewport: { width: 360, height: 800 } } }
  ],
  webServer
});
