// Build en Vercel. Solo en producción aplica las migraciones pendientes antes de compilar,
// así una vista previa nunca modifica la base de producción.
import { execSync } from "node:child_process";

const correr = (comando) => execSync(comando, { stdio: "inherit" });

if (process.env.VERCEL_ENV === "production") {
  correr("npx prisma migrate deploy");
} else {
  console.log(`Entorno ${process.env.VERCEL_ENV ?? "local"}: no se aplican migraciones.`);
}
correr("npx next build");
