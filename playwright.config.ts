import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
// Use `localhost`, not `127.0.0.1`: Next 16 treats them as different origins and
// blocks /_next dev resources for the non-canonical one.
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  outputDir: "test-results",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      // Pixel 7 is Chromium-based; only Chromium is installed in this environment.
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    // `next dev` refuses to boot while NODE_ENV=production, so force development.
    command: `npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 180_000,
    env: { NODE_ENV: "development" },
  },
});
