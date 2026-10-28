"use client";

import { useSyncExternalStore } from "react";

// Reloj compartido que avisa cada 30 segundos a todos los componentes que lo usan.
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

/** Hora actual (redondeada a 30 s) en el navegador; null durante el render del servidor. */
export function useAhora(): number | null {
  return useSyncExternalStore(suscribir, ahora, () => null);
}
