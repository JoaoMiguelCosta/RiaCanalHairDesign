// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import routeDocuments from "./scripts/routeDocuments.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // routeDocuments: HTML inicial com metadados por rota (index, termos,
  // privacidade, 404) e emulação local das regras estáticas da Vercel.
  plugins: [react(), routeDocuments()],
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "src/app"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@widgets": path.resolve(__dirname, "src/widgets"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@content": path.resolve(__dirname, "src/content"),
      "@media": path.resolve(__dirname, "src/content/media"),
    },
  },
});
