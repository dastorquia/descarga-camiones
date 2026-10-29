// Tableros: sector de cada descarga, alerta de tramos olvidados y estado de las bombas.

export const SIN_SECTOR = "Otras bombas";

type ConUltimaBomba = { tramos: { bomba: { descripcion: string | null } }[] };

/** Sector de la descarga: el de la bomba de su último tramo. */
export function sectorDe(descarga: ConUltimaBomba): string {
  return descarga.tramos.at(-1)?.bomba.descripcion ?? SIN_SECTOR;
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

type MantenimientoAbierto = { bombaId: number; desde: Date; motivo: string | null };

export type EstadoBomba = Bomba & {
  ocupadaPor: { descargaId: number; hojaDeRuta: string; desde: Date } | null;
  mantenimiento: { desde: Date; motivo: string | null } | null;
};

/** Cada bomba: ocupada (por qué descarga), en mantenimiento, o libre. */
export function estadoBombas(
  bombas: readonly Bomba[],
  abiertos: readonly TramoAbierto[],
  mantenimientos: readonly MantenimientoAbierto[] = [],
): EstadoBomba[] {
  return bombas.map((b) => {
    const t = abiertos.find((a) => a.bombaId === b.id);
    const m = mantenimientos.find((x) => x.bombaId === b.id);
    return {
      ...b,
      ocupadaPor: t ? { descargaId: t.descarga.id, hojaDeRuta: t.descarga.hojaDeRuta, desde: t.inicio } : null,
      mantenimiento: m ? { desde: m.desde, motivo: m.motivo } : null,
    };
  });
}
