"use client";

import { formatearDuracion } from "@/shared/lib/fechas";
import { useAhora } from "./reloj";

/** Tiempo transcurrido desde un instante, actualizado solo. Solo para mostrar, nunca para estadísticas. */
export function TiempoDesde({ desde }: { desde: string }) {
  const instante = useAhora();
  if (instante === null) return <span>…</span>;
  return <span>{formatearDuracion(Math.max(0, instante - Date.parse(desde)))}</span>;
}
