/** "Descarga 1" → "D1"; otros textos quedan igual. */
export function sectorCorto(sector: string | null): string | null {
  if (!sector) return null;
  const m = /^Descarga\s+(\d+)$/i.exec(sector.trim());
  return m ? `D${m[1]}` : sector;
}

/** Texto de la bomba en listas y desplegables: "D1-BCI010". */
export function etiquetaBomba(codigo: string, sector: string | null): string {
  const corto = sectorCorto(sector);
  return corto ? `${corto}-${codigo}` : codigo;
}

/** Texto destacado al elegir una bomba: "Descarga 1 · Bomba BCI010". */
export function nombreBomba(codigo: string, sector: string | null): string {
  return sector ? `${sector} · Bomba ${codigo}` : `Bomba ${codigo}`;
}
