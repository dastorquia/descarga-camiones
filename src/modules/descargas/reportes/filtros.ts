import { aDiaHora } from "@/shared/lib/fechas";

// Filtros de los reportes: período (días de Argentina) y tipo de operación.

export type FiltrosReporte = { desde: string; hasta: string; tipo: "DESCARGA" | "CARGA" | null };

type Parametros = Record<string, string | string[] | undefined>;
const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || null;
const dia = (v: string | null) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

/** Sin fechas, el período es el mes en curso (hasta hoy). */
export function leerFiltrosReporte(p: Parametros, ahora: Date): FiltrosReporte {
  const hoy = aDiaHora(ahora).dia;
  let desde = dia(uno(p.desde)) ?? `${hoy.slice(0, 8)}01`;
  let hasta = dia(uno(p.hasta)) ?? hoy;
  if (desde > hasta) [desde, hasta] = [hasta, desde];
  const tipo = uno(p.tipo);
  return { desde, hasta, tipo: tipo === "DESCARGA" || tipo === "CARGA" ? tipo : null };
}

export function parametrosReporte(f: FiltrosReporte): string {
  const p = new URLSearchParams({ desde: f.desde, hasta: f.hasta });
  if (f.tipo) p.set("tipo", f.tipo);
  return p.toString();
}
