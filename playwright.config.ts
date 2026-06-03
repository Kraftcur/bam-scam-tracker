import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      NODE_OPTIONS: ""
    }
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] }
    }
  ]
});
