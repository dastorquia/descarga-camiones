import "server-only";
import { db } from "@/shared/lib/db";
import { CLAVES_CONFIG, VALORES_INICIALES } from "./claves";

export type Umbrales = { toneladasMin: number; toneladasMax: number; horasAlertaTramoAbierto: number };

/** Umbrales configurables; si falta alguno, se usa el valor inicial. */
export async function leerUmbrales(): Promise<Umbrales> {
  const filas = await db.config.findMany({
    where: {
      clave: {
        in: [CLAVES_CONFIG.toneladasMin, CLAVES_CONFIG.toneladasMax, CLAVES_CONFIG.horasAlertaTramoAbierto],
      },
    },
  });
  const valor = (clave: keyof typeof VALORES_INICIALES) =>
    Number(filas.find((f) => f.clave === CLAVES_CONFIG[clave])?.valor ?? VALORES_INICIALES[clave]);
  return {
    toneladasMin: valor("toneladasMin"),
    toneladasMax: valor("toneladasMax"),
    horasAlertaTramoAbierto: valor("horasAlertaTramoAbierto"),
  };
}
