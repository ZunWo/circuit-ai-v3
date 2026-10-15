import { defineConfig, devices } from "@playwright/test";

const testPort = Number(process.env.CIRCUIT_TEST_PORT ?? 5173);

// Uses the installed Edge browser; no extra browser download is required on Windows.
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${testPort}`,
    headless: true,
    channel: "msedge",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        defaultBrowserType: "chromium",
        channel: "msedge",
      },
    },
  ],
  webServer: [
    {
      command: `npm.cmd run dev -- --port ${testPort} --strictPort`,
      url: `http://127.0.0.1:${testPort}`,
      reuseExistingServer: false,
      env: { VITE_TM_MODEL_URL: "" },
    },
    {
      command: `npm.cmd run dev -- --port ${testPort + 1} --strictPort`,
      url: `http://127.0.0.1:${testPort + 1}`,
      reuseExistingServer: false,
      env: { VITE_TM_MODEL_URL: "/models/test-missing/" },
    },
  ],
});
