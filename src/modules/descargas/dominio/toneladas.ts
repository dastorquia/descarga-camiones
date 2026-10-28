// Cantidades (sección 5 y 13): en pantalla y en los formularios se usan KILOS enteros
// ("28.000 kg"). En la base se guardan como toneladas Decimal(10,3), que es la misma
// precisión (3 decimales de tonelada = 1 kg). Se manejan como texto ("28.000") para no
// perder precisión con números de punto flotante.

export type ResultadoKilos = { ok: true; kilos: number; valor: string } | { ok: false; error: string };

const MAXIMO_KILOS = 9_999_999;

/** "28000" o "28.000" (punto de miles) → 28000 kg, y "28.000" como toneladas para la base. */
export function interpretarKilos(texto: string): ResultadoKilos {
  const limpio = texto.trim().replace(/\s/g, "").replace(/kg$/i, "");
  if (limpio === "") return { ok: false, error: "Cargá los kilos." };
  if (limpio.includes(",")) return { ok: false, error: "Los kilos van sin decimales, por ejemplo 28000." };
  if (!/^\d{1,3}(\.\d{3})*$|^\d+$/.test(limpio)) {
    return { ok: false, error: "Escribí los kilos solo con números, por ejemplo 28000." };
  }
  const kilos = Number(limpio.replace(/\./g, ""));
  if (kilos <= 0) return { ok: false, error: "Los kilos tienen que ser mayores a 0." };
  if (kilos > MAXIMO_KILOS) return { ok: false, error: "La cantidad es demasiado grande." };
  return { ok: true, kilos, valor: kilosATexto(kilos) };
}

/** 28000 → "28.000" (toneladas con 3 decimales, como se guarda en la base). */
export function kilosATexto(kilos: number): string {
  return `${Math.floor(kilos / 1000)}.${String(kilos % 1000).padStart(3, "0")}`;
}

/** Toneladas guardadas ("28.450" o Decimal) → kilos enteros. */
export function aKilosDesdeBase(valor: string | { toString(): string }): number {
  const [entero = "0", decimales = ""] = valor.toString().split(".");
  return Number(entero) * 1000 + Number(decimales.padEnd(3, "0").slice(0, 3));
}

/** "28.000 kg", o "—" si todavía no se cargaron (nunca 0). */
export function formatearKilos(valor: string | { toString(): string } | null | undefined): string {
  if (valor === null || valor === undefined) return "—";
  return `${aKilosDesdeBase(valor).toLocaleString("es-AR")} kg`;
}

/** Kilos enteros → "28.000 kg". */
export function mostrarKilos(kilos: number): string {
  return `${kilos.toLocaleString("es-AR")} kg`;
}

/** Advertencia no bloqueante si los kilos están fuera del rango habitual. */
export function advertenciaKilos(kilos: number, minimoKilos: number, maximoKilos: number): string | null {
  if (kilos >= minimoKilos && kilos <= maximoKilos) return null;
  return `${mostrarKilos(kilos)} está fuera de lo habitual (entre ${mostrarKilos(minimoKilos)} y ${mostrarKilos(maximoKilos)}). Revisá que esté bien escrito.`;
}
