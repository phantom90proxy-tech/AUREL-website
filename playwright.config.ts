import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 120000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3112",
    launchOptions: {
      executablePath:
        process.env.CHROME_PATH ||
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
    },
    headless: true,
  },
  webServer: {
    command:
      "node node_modules/serve/build/main.js out --listen 3112 --no-clipboard",
    url: "http://127.0.0.1:3112",
    env: { NO_UPDATE_CHECK: "1" },
    reuseExistingServer: false,
    timeout: 120000,
  },
});
