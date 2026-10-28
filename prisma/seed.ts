import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  CLAVES_CONFIG,
  PIN_INICIAL,
  VALORES_INICIALES,
} from "../src/shared/config/claves";
import { BOMBAS, OPERARIOS, PRODUCTOS, PROVEEDORES, TANQUES } from "./catalogos";

// El seed se puede correr varias veces: no duplica catálogos ni pisa
// valores ya cambiados (por ejemplo, un PIN que el Supervisor actualizó).

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env["DIRECT_URL"] }),
});

async function crearConfigSiFalta(clave: string, valor: string) {
  await db.config.upsert({ where: { clave }, update: {}, create: { clave, valor } });
}

async function main() {
  const hash = await bcrypt.hash(PIN_INICIAL, 12);
  await crearConfigSiFalta(CLAVES_CONFIG.pinSupervisorHash, hash);
  await crearConfigSiFalta(CLAVES_CONFIG.pinPorDefecto, "true");
  await crearConfigSiFalta(CLAVES_CONFIG.toneladasMin, VALORES_INICIALES.toneladasMin);
  await crearConfigSiFalta(CLAVES_CONFIG.toneladasMax, VALORES_INICIALES.toneladasMax);
  await crearConfigSiFalta(
    CLAVES_CONFIG.horasAlertaTramoAbierto,
    VALORES_INICIALES.horasAlertaTramoAbierto,
  );

  await db.producto.createMany({ data: PRODUCTOS.map((nombre) => ({ nombre })), skipDuplicates: true });
  await db.proveedor.createMany({ data: PROVEEDORES.map((nombre) => ({ nombre })), skipDuplicates: true });
  await db.operario.createMany({ data: OPERARIOS.map((nombre) => ({ nombre })), skipDuplicates: true });
  await db.bomba.createMany({ data: BOMBAS, skipDuplicates: true });
  await db.tanque.createMany({ data: TANQUES.map((codigo) => ({ codigo })), skipDuplicates: true });

  console.log(
    `Seed listo: ${PRODUCTOS.length} productos, ${PROVEEDORES.length} proveedores, ` +
      `${OPERARIOS.length} operarios, ${BOMBAS.length} bombas, ${TANQUES.length} tanques.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
