import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

// Define __dirname for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  root: ".", // Ensure this points to the directory containing index.html
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server": path.resolve(__dirname, "../server"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});