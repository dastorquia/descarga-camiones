import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts", "prisma/**/*.test.ts"],
    // Las de integración usan la base real: npm run test:integracion.
    exclude: ["**/node_modules/**", "**/*.integracion.test.ts"],
  },
});
