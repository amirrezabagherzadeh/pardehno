import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    locale: "fa-IR",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: "node tests/fixtures/tmdb-server.mjs",
      url: "http://127.0.0.1:4010/movie/popular",
      name: "TMDB fixture",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "npx next dev -H 127.0.0.1 -p 3000",
      url: "http://127.0.0.1:3000",
      name: "Next.js",
      env: {
        TMDB_BASE_URL: "http://127.0.0.1:4010/3",
        TMDB_FIXTURE_MODE: "true",
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
