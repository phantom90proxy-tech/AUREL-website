import { defineConfig } from "@playwright/test";
import production from "./playwright.config";

export default defineConfig({
  ...production,
  use: { ...production.use, baseURL: "http://127.0.0.1:3100" },
  webServer: {
    command: "node node_modules/next/dist/bin/next dev --port 3100",
    // A static health URL lets tests start even when a page has a runtime error.
    url: "http://127.0.0.1:3100/icon.png",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
