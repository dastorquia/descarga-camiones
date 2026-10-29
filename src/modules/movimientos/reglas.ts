import { esFuturo } from "@/modules/descargas/dominio/reglas";

// Reglas del movimiento interno (sección 13, 29/10/2026). Funciones puras.

export type DatosMovimiento = {
  inicio: Date;
  fin: Date;
  tanqueOrigenId: number;
  tanqueDestinoId: number;
  bombaCargaId: number;
  bombaDescargaId: number;
};

export function errorEnMovimiento(m: DatosMovimiento, ahora: Date): string | null {
  if (m.tanqueOrigenId === m.tanqueDestinoId) return "El tanque de origen y el de destino tienen que ser distintos.";
  if (m.bombaCargaId === m.bombaDescargaId) return "La bomba de carga y la de descarga tienen que ser distintas.";
  if (m.fin.getTime() <= m.inicio.getTime()) return "La hora de fin tiene que ser posterior al inicio.";
  if (esFuturo(m.fin, ahora)) return "La hora de fin no puede ser futura.";
  return null;
}

/** Intervalos de bomba que aporta un movimiento: uno por cada bomba (para las horas de uso). */
export function intervalosDeMovimiento(m: { inicio: Date; fin: Date; bombaCargaId: number; bombaDescargaId: number }) {
  return [
    { bombaId: m.bombaCargaId, inicio: m.inicio, fin: m.fin, toneladas: null },
    { bombaId: m.bombaDescargaId, inicio: m.inicio, fin: m.fin, toneladas: null },
  ];
}
