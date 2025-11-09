import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@cursor/2048-game-core": fileURLToPath(
        new URL("../../packages/game-core/src", import.meta.url),
      ),
    },
  },
});
