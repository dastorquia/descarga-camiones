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

/**
 * Alerta de olvido (sección 5): un tramo abierto hace más de `horas` horas.
 * Es solo una marca visual; nunca suma horas de bomba.
 */
export function tramoEnAlerta(inicio: Date, ahora: Date, horas: number): boolean {
  return ahora.getTime() - inicio.getTime() > horas * 3_600_000;
}

type Bomba = { id: number; codigo: string; sector: string | null };
type TramoAbierto = { bombaId: number; inicio: Date; descarga: { id: number; hojaDeRuta: string } };

export type EstadoBomba = Bomba & {
  ocupadaPor: { descargaId: number; hojaDeRuta: string; desde: Date } | null;
};

/** Cada bomba con la descarga que la ocupa (tramo abierto), o libre. */
export function estadoBombas(bombas: readonly Bomba[], abiertos: readonly TramoAbierto[]): EstadoBomba[] {
  return bombas.map((b) => {
    const t = abiertos.find((a) => a.bombaId === b.id);
    return {
      ...b,
      ocupadaPor: t ? { descargaId: t.descarga.id, hojaDeRuta: t.descarga.hojaDeRuta, desde: t.inicio } : null,
    };
  });
}
