// Validación de los umbrales configurables (sección 6.7).

export type UmbralesTexto = { toneladasMin: string; toneladasMax: string; horasAlertaTramoAbierto: string };

type Resultado = { ok: true; valores: UmbralesTexto } | { ok: false; error: string };

/** "3" o "2,5" → "3" / "2.5". Hasta 3 decimales, mayor a 0. */
function numero(texto: string, nombre: string): { ok: true; valor: string } | { ok: false; error: string } {
  const limpio = texto.trim().replace(/\s/g, "");
  if (limpio.includes(".")) return { ok: false, error: `${nombre}: usá coma para los decimales.` };
  if (!/^\d{1,4}(,\d{1,3})?$/.test(limpio)) return { ok: false, error: `${nombre}: escribí un número, por ejemplo 3 o 2,5.` };
  const valor = String(Number(limpio.replace(",", ".")));
  if (Number(valor) <= 0) return { ok: false, error: `${nombre}: tiene que ser mayor a 0.` };
  return { ok: true, valor };
}

export function validarUmbrales(entrada: UmbralesTexto): Resultado {
  const min = numero(entrada.toneladasMin, "Toneladas mínimas");
  if (!min.ok) return min;
  const max = numero(entrada.toneladasMax, "Toneladas máximas");
  if (!max.ok) return max;
  if (Number(min.valor) >= Number(max.valor)) {
    return { ok: false, error: "Las toneladas mínimas tienen que ser menores que las máximas." };
  }
  const horas = entrada.horasAlertaTramoAbierto.trim();
  if (!/^\d{1,3}$/.test(horas) || Number(horas) < 1 || Number(horas) > 168) {
    return { ok: false, error: "Las horas de alerta tienen que ser un número entero entre 1 y 168." };
  }
  return { ok: true, valores: { toneladasMin: min.valor, toneladasMax: max.valor, horasAlertaTramoAbierto: String(Number(horas)) } };
}
