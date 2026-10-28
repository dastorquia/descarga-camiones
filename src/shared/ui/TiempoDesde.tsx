"use client";

import { useSyncExternalStore } from "react";
import { formatearDuracion } from "@/shared/lib/fechas";

// Reloj compartido que avisa cada 30 segundos.
const oyentes = new Set<() => void>();
let intervalo: ReturnType<typeof setInterval> | undefined;

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  intervalo ??= setInterval(() => oyentes.forEach((o) => o()), 30_000);
  return () => {
    oyentes.delete(avisar);
    if (oyentes.size === 0) {
      clearInterval(intervalo);
      intervalo = undefined;
    }
  };
}

const ahora = () => Math.floor(Date.now() / 30_000) * 30_000;

/** Tiempo transcurrido desde un instante, actualizado solo. Solo para mostrar, nunca para estadísticas. */
export function TiempoDesde({ desde }: { desde: string }) {
  const instante = useSyncExternalStore(suscribir, ahora, () => null);
  if (instante === null) return <span>…</span>;
  return <span>{formatearDuracion(Math.max(0, instante - Date.parse(desde)))}</span>;
}
