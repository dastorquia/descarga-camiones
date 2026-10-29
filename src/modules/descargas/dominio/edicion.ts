import { esFuturo } from "./reglas";
import { aKilosDesdeBase, kilosATexto } from "./toneladas";

// Reglas para editar tramos y asignar kilos por tramo (Etapa 5).

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

/** La suma de los kilos asignados a los tramos no puede superar el total (sección 5). */
export function errorEnAsignacion(total: string, asignadas: readonly (string | null)[]): string | null {
  const suma = asignadas.reduce((s, v) => s + (v ? aKilosDesdeBase(v) : 0), 0);
  if (suma > aKilosDesdeBase(total)) {
    return `Lo asignado a los tramos (${suma.toLocaleString("es-AR")} kg) supera el total de la descarga (${aKilosDesdeBase(total).toLocaleString("es-AR")} kg).`;
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
  const resto = aKilosDesdeBase(total) - asignadas.reduce((s, v) => s + (v ? aKilosDesdeBase(v) : 0), 0);
  return resto > 0 ? { indice: vacios[0]!, valor: kilosATexto(resto) } : null;
}

type Estado = "EN_CURSO" | "PAUSADA" | "FINALIZADA";
type TramoConBomba = TramoEditable & { bombaId: number };

export type EfectoQuitar =
  | { ok: false; error: string }
  | { ok: true; nuevoEstado: Estado; limpiarAsignaciones: boolean };

/**
 * Qué pasa al quitar un tramo cargado por error. Siempre queda al menos uno.
 * Si se quita el tramo en curso, la descarga queda pausada. Si después queda
 * una sola bomba, se borran las toneladas asignadas por tramo (ya no aplican).
 */
export function efectoDeQuitar(estado: Estado, tramos: readonly TramoConBomba[], tramoId: number): EfectoQuitar {
  const tramo = tramos.find((t) => t.id === tramoId);
  if (!tramo) return { ok: false, error: "El tramo no es de esta descarga." };
  if (tramos.length === 1) return { ok: false, error: "La descarga tiene que tener al menos un tramo." };
  const restantes = tramos.filter((t) => t.id !== tramoId);
  return {
    ok: true,
    nuevoEstado: tramo.fin === null && estado === "EN_CURSO" ? "PAUSADA" : estado,
    limpiarAsignaciones: !usaVariasBombas(restantes),
  };
}

/** Hay asignación por tramo solo si la descarga usó más de una bomba. */
export function usaVariasBombas(tramos: readonly { bombaId: number }[]): boolean {
  return new Set(tramos.map((t) => t.bombaId)).size > 1;
}
