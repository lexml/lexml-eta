import { defineConfig, devices } from '@playwright/test';

// E2E colaborativo (dois BrowserContext). Orquestra: dev-server (webServer) + servidor WS (globalSetup).
export default defineConfig({
  testDir: './e2e-collab',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  globalSetup: './e2e-collab/global-setup.ts',
  globalTeardown: './e2e-collab/global-teardown.ts',
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:8000/demo',
    timeout: 240_000,
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
