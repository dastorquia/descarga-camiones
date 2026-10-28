import { esFuturo } from "./reglas";

// Reglas para editar tramos y asignar toneladas por tramo (Etapa 5).

export type TramoEditable = { id: number; inicio: Date; fin: Date | null };

/**
 * Valida el conjunto de tramos de una descarga después de una edición:
 * fin posterior al inicio, sin horas futuras, en orden y sin superponerse,
 * y solo el último puede seguir abierto.
 */
export function errorEnTramos(tramos: readonly TramoEditable[], ahora: Date): string | null {
  const ordenados = [...tramos].sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  for (let i = 0; i < ordenados.length; i++) {
    const t = ordenados[i]!;
    const n = i + 1;
    if (esFuturo(t.inicio, ahora)) return `El inicio del tramo ${n} no puede ser futuro.`;
    if (t.fin) {
      if (t.fin.getTime() <= t.inicio.getTime()) return `En el tramo ${n}, el fin tiene que ser posterior al inicio.`;
      if (esFuturo(t.fin, ahora)) return `El fin del tramo ${n} no puede ser futuro.`;
    } else if (i < ordenados.length - 1) {
      return "Solo el último tramo puede estar en curso.";
    }
    const anterior = ordenados[i - 1];
    if (anterior?.fin && t.inicio.getTime() < anterior.fin.getTime()) {
      return `El tramo ${n} empieza antes de que termine el tramo ${n - 1}.`;
    }
  }
  return null;
}

// Toneladas en kilos enteros para sumar y restar sin errores de redondeo.

/** "28.450" → 28450 */
export function aKilos(toneladas: string): number {
  const [entero = "0", decimales = ""] = toneladas.split(".");
  return Number(entero) * 1000 + Number(decimales.padEnd(3, "0").slice(0, 3));
}

/** 28450 → "28.450" */
export function desdeKilos(kilos: number): string {
  return `${Math.floor(kilos / 1000)}.${String(kilos % 1000).padStart(3, "0")}`;
}

/** La suma de las toneladas asignadas a los tramos no puede superar el total (sección 5). */
export function errorEnAsignacion(total: string, asignadas: readonly (string | null)[]): string | null {
  const suma = asignadas.reduce((s, v) => s + (v ? aKilos(v) : 0), 0);
  if (suma > aKilos(total)) {
    return `Lo asignado a los tramos (${desdeKilos(suma).replace(".", ",")} t) supera el total de la descarga (${total.replace(".", ",")} t).`;
  }
  return null;
}

/**
 * Propuesta para el último tramo sin asignar: el resto del total.
 * Solo cuando queda exactamente un tramo vacío y el resto es mayor a cero.
 */
export function propuestaResto(total: string, asignadas: readonly (string | null)[]): { indice: number; valor: string } | null {
  const vacios = asignadas.flatMap((v, i) => (v ? [] : [i]));
  if (vacios.length !== 1) return null;
  const resto = aKilos(total) - asignadas.reduce((s, v) => s + (v ? aKilos(v) : 0), 0);
  return resto > 0 ? { indice: vacios[0]!, valor: desdeKilos(resto) } : null;
}

/** Hay asignación por tramo solo si la descarga usó más de una bomba. */
export function usaVariasBombas(tramos: readonly { bombaId: number }[]): boolean {
  return new Set(tramos.map((t) => t.bombaId)).size > 1;
}
