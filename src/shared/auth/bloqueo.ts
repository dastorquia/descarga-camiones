// Bloqueo por intentos fallidos de PIN (sección 3 y 13 de la especificación).
// Se cuenta por dispositivo y por IP. Lógica pura: el guardado está en pin.ts.

export type EstadoIntentos = {
  fallidos: number;
  bloqueadoHasta: Date | null;
};

export const DURACION_BLOQUEO_MS = 5 * 60_000;

/** Intentos fallidos que bloquean. Por IP es mayor porque toda la planta
 * puede salir a internet con la misma IP. */
export const LIMITE_FALLIDOS = { dispositivo: 5, ip: 20 } as const;

export const SIN_INTENTOS: EstadoIntentos = { fallidos: 0, bloqueadoHasta: null };

export function bloqueadoHasta(estado: EstadoIntentos, ahora: Date): Date | null {
  return estado.bloqueadoHasta && estado.bloqueadoHasta > ahora ? estado.bloqueadoHasta : null;
}

export function registrarFallo(
  estado: EstadoIntentos,
  limite: number,
  ahora: Date,
): EstadoIntentos {
  // Un bloqueo que ya pasó arranca la cuenta de cero.
  const previos = estado.bloqueadoHasta && estado.bloqueadoHasta <= ahora ? 0 : estado.fallidos;
  const fallidos = previos + 1;
  if (fallidos >= limite) {
    return { fallidos: 0, bloqueadoHasta: new Date(ahora.getTime() + DURACION_BLOQUEO_MS) };
  }
  return { fallidos, bloqueadoHasta: null };
}

export function minutosRestantes(hasta: Date, ahora: Date): number {
  return Math.max(1, Math.ceil((hasta.getTime() - ahora.getTime()) / 60_000));
}
