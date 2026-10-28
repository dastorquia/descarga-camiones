// Toneladas (sección 5): Decimal con 3 decimales, coma decimal, unidad "t".
// Se manejan como texto ("28.450") para no perder precisión con números de punto flotante.

export type ResultadoToneladas = { ok: true; valor: string } | { ok: false; error: string };

/** Interpreta lo que escribió la persona ("28,450") y lo devuelve como "28.450". */
export function interpretarToneladas(texto: string): ResultadoToneladas {
  const limpio = texto.trim().replace(/\s/g, "").replace(/t$/i, "");
  if (limpio === "") return { ok: false, error: "Cargá las toneladas." };
  if (limpio.includes(".")) {
    return { ok: false, error: "Usá coma para los decimales, por ejemplo 28,450." };
  }
  const m = /^(\d{1,7})(?:,(\d{1,3}))?$/.exec(limpio);
  if (!m) {
    return { ok: false, error: "Escribí un número con hasta 3 decimales, por ejemplo 28,450." };
  }
  const entero = String(Number(m[1]));
  const decimales = (m[2] ?? "").padEnd(3, "0");
  const valor = `${entero}.${decimales}`;
  if (Number(valor) <= 0) return { ok: false, error: "Las toneladas tienen que ser mayores a 0." };
  return { ok: true, valor };
}

/** Advertencia no bloqueante si el valor está fuera del rango habitual. */
export function advertenciaToneladas(valor: string, minimo: number, maximo: number): string | null {
  const n = Number(valor);
  if (n >= minimo && n <= maximo) return null;
  return (
    `${formatearToneladas(valor)} está fuera de lo habitual ` +
    `(entre ${formatearToneladas(String(minimo))} y ${formatearToneladas(String(maximo))}). ` +
    "Revisá que esté bien escrito."
  );
}

/** "28,450 t", o "—" si todavía no se cargaron (nunca 0). */
export function formatearToneladas(valor: string | { toString(): string } | null | undefined): string {
  if (valor === null || valor === undefined) return "—";
  const n = Number(valor.toString());
  return `${n.toLocaleString("es-AR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} t`;
}
