import "dotenv/config";
import { defineConfig } from "prisma/config";

// El CLI (migraciones, seed, studio) usa la conexión directa de Neon, sin pooler.
// La app en ejecución usa DATABASE_URL (con pooler); ver src/shared/lib/db.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
