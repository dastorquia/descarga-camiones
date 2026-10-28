// Agrupación del tablero de inicio por sector de bomba (Descarga 1, 2, 3).

export const SIN_SECTOR = "Otras bombas";

type ConUltimaBomba = { tramos: { bomba: { descripcion: string | null } }[] };

/** Sector de la descarga: el de la bomba de su último tramo. */
export function sectorDe(descarga: ConUltimaBomba): string {
  return descarga.tramos.at(-1)?.bomba.descripcion ?? SIN_SECTOR;
}

/**
 * Agrupa las descargas por sector, en el orden de `sectores`. Los sectores
 * sin descargas igual aparecen (vacíos), para mostrarlos como libres.
 */
export function agruparPorSector<T extends ConUltimaBomba>(
  sectores: readonly string[],
  descargas: readonly T[],
): { sector: string; descargas: T[] }[] {
  const grupos = new Map<string, T[]>(sectores.map((s) => [s, []]));
  for (const d of descargas) {
    const sector = sectorDe(d);
    if (!grupos.has(sector)) grupos.set(sector, []);
    grupos.get(sector)!.push(d);
  }
  return [...grupos].map(([sector, lista]) => ({ sector, descargas: lista }));
}
