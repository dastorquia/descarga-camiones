// Horas de bomba (sección 5): salen solo de los tramos CERRADOS.
// Un tramo abierto nunca se calcula con la hora actual: se muestra "en curso".

export type Intervalo = { inicio: Date; fin: Date | null };

const HORA_MS = 3_600_000;

/** Horas de un tramo cerrado; null si sigue abierto. */
export function horasTramo(tramo: Intervalo): number | null {
  return tramo.fin ? (tramo.fin.getTime() - tramo.inicio.getTime()) / HORA_MS : null;
}

/** Suma de horas de los tramos cerrados. */
export function horasBomba(tramos: readonly Intervalo[]): number {
  let ms = 0;
  for (const t of tramos) if (t.fin) ms += t.fin.getTime() - t.inicio.getTime();
  return ms / HORA_MS;
}

/** "6,75 h" */
export function formatearHoras(horas: number): string {
  return `${horas.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} h`;
}
