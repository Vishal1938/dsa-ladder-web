import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development the API runs on :8080 (Spring Boot) or :8787 (tools/devserver). Override with VITE_API_TARGET.
export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 4000 },
  server: {
    port: 5173,
    proxy: { "/api": process.env.VITE_API_TARGET ?? "http://localhost:8080" },
  },
});
