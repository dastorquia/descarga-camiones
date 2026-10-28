import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pruebas contra la base real (usa DATABASE_URL del .env). No dejan datos.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.integracion.test.ts"],
    testTimeout: 30_000,
  },
});
