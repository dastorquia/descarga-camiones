import { interpretarKilos } from "@/modules/descargas/dominio/toneladas";

// Validación de los umbrales configurables (sección 6.7). En pantalla, el rango es
// en kilos; en Config se guarda en toneladas (claves toneladasMin/Max).

export type UmbralesTexto = { kilosMin: string; kilosMax: string; horasAlertaTramoAbierto: string };

/** Valores listos para guardar en Config. */
export type UmbralesConfig = { toneladasMin: string; toneladasMax: string; horasAlertaTramoAbierto: string };

type Resultado = { ok: true; valores: UmbralesConfig } | { ok: false; error: string };

export function validarUmbrales(entrada: UmbralesTexto): Resultado {
  const min = interpretarKilos(entrada.kilosMin);
  if (!min.ok) return { ok: false, error: `Kilos mínimos: ${min.error}` };
  const max = interpretarKilos(entrada.kilosMax);
  if (!max.ok) return { ok: false, error: `Kilos máximos: ${max.error}` };
  if (min.kilos >= max.kilos) {
    return { ok: false, error: "Los kilos mínimos tienen que ser menores que los máximos." };
  }
  const horas = entrada.horasAlertaTramoAbierto.trim();
  if (!/^\d{1,3}$/.test(horas) || Number(horas) < 1 || Number(horas) > 168) {
    return { ok: false, error: "Las horas de alerta tienen que ser un número entero entre 1 y 168." };
  }
  return {
    ok: true,
    valores: {
      toneladasMin: String(min.kilos / 1000),
      toneladasMax: String(max.kilos / 1000),
      horasAlertaTramoAbierto: String(Number(horas)),
    },
  };
}
