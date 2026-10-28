/** "Descarga 1" → "D1"; otros textos quedan igual. */
export function sectorCorto(sector: string | null): string | null {
  if (!sector) return null;
  const m = /^Descarga\s+(\d+)$/i.exec(sector.trim());
  return m ? `D${m[1]}` : sector;
}
