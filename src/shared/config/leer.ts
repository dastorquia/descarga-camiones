import "server-only";
import { db } from "@/shared/lib/db";
import { CLAVES_CONFIG, VALORES_INICIALES } from "./claves";

/** Umbrales en las unidades de pantalla: kilos y horas. */
export type Umbrales = { kilosMin: number; kilosMax: number; horasAlertaTramoAbierto: number };

/**
 * Umbrales configurables; si falta alguno, se usa el valor inicial.
 * El rango se guarda en toneladas (claves toneladasMin/Max) y se devuelve en kilos.
 */
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
    kilosMin: Math.round(valor("toneladasMin") * 1000),
    kilosMax: Math.round(valor("toneladasMax") * 1000),
    horasAlertaTramoAbierto: valor("horasAlertaTramoAbierto"),
  };
}
