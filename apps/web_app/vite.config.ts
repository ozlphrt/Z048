import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

const GITHUB_PAGES_BASE = "/Z048/";
const isGitHubPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  base: isGitHubPages ? GITHUB_PAGES_BASE : "/",
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  resolve: {
    alias: {
      "@modern2048/game_core": resolve(__dirname, "../../packages/game_core/src")
    }
  }
});

