import { aDiaHora, desdeDiaHora } from "@/shared/lib/fechas";
import { aKilos, usaVariasBombas } from "./edicion";

// Cálculos de los reportes (sección 7). Funciones puras: reciben las descargas ya leídas.
// Las cantidades se suman en kilos enteros; las horas salen solo de tramos cerrados.
// El rendimiento es en kg/h.

const HORA_MS = 3_600_000;

export type TramoReporte = {
  bombaId: number;
  inicio: Date;
  fin: Date | null;
  /** Toneladas asignadas por el Supervisor ("28.450"), o null. */
  toneladas: string | null;
};

export type DescargaReporte = {
  id: number;
  hojaDeRuta: string;
  tipo: "DESCARGA" | "CARGA";
  estado: "EN_CURSO" | "PAUSADA" | "FINALIZADA";
  productoId: number;
  proveedorId: number;
  tanqueId: number;
  toneladas: string | null;
  tramos: TramoReporte[];
};

export type Rango = { desde: Date; hasta: Date };

/** Día siguiente a "AAAA-MM-DD" (calendario). */
function diaSiguiente(dia: string): string {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Reparte un intervalo entre los días de Argentina, cortando en la medianoche.
 * 22:00 a 02:00 → 2 h el primer día y 2 h el segundo.
 */
export function repartirPorDia(inicio: Date, fin: Date): { dia: string; horas: number }[] {
  const partes: { dia: string; horas: number }[] = [];
  let desde = inicio;
  while (desde < fin) {
    const dia = aDiaHora(desde).dia;
    const medianoche = desdeDiaHora(diaSiguiente(dia), "00:00")!;
    const hasta = medianoche < fin ? medianoche : fin;
    partes.push({ dia, horas: (hasta.getTime() - desde.getTime()) / HORA_MS });
    desde = hasta;
  }
  return partes;
}

/** Recorta un tramo cerrado al rango del reporte; null si queda afuera o está abierto. */
function recortar(t: TramoReporte, rango: Rango): { inicio: Date; fin: Date } | null {
  if (!t.fin) return null;
  const inicio = t.inicio > rango.desde ? t.inicio : rango.desde;
  const fin = t.fin < rango.hasta ? t.fin : rango.hasta;
  return inicio < fin ? { inicio, fin } : null;
}

export type HorasBombaDia = { bombaId: number; dia: string; horas: number };

/** Horas de funcionamiento por bomba y por día (repartidas en la medianoche), dentro del rango. */
export function horasPorBombaPorDia(descargas: readonly DescargaReporte[], rango: Rango): HorasBombaDia[] {
  const suma = new Map<string, HorasBombaDia>();
  for (const d of descargas) {
    for (const t of d.tramos) {
      const r = recortar(t, rango);
      if (!r) continue;
      for (const { dia, horas } of repartirPorDia(r.inicio, r.fin)) {
        const clave = `${t.bombaId}|${dia}`;
        const actual = suma.get(clave) ?? { bombaId: t.bombaId, dia, horas: 0 };
        actual.horas += horas;
        suma.set(clave, actual);
      }
    }
  }
  return [...suma.values()].sort((a, b) => a.dia.localeCompare(b.dia) || a.bombaId - b.bombaId);
}

/** Agrupa las horas diarias por mes ("AAAA-MM"). */
export function horasPorBombaPorMes(porDia: readonly HorasBombaDia[]): { bombaId: number; mes: string; horas: number }[] {
  const suma = new Map<string, { bombaId: number; mes: string; horas: number }>();
  for (const h of porDia) {
    const mes = h.dia.slice(0, 7);
    const clave = `${h.bombaId}|${mes}`;
    const actual = suma.get(clave) ?? { bombaId: h.bombaId, mes, horas: 0 };
    actual.horas += h.horas;
    suma.set(clave, actual);
  }
  return [...suma.values()].sort((a, b) => a.mes.localeCompare(b.mes) || a.bombaId - b.bombaId);
}

const horasDe = (tramos: readonly TramoReporte[]) =>
  tramos.reduce((s, t) => s + (t.fin ? t.fin.getTime() - t.inicio.getTime() : 0), 0) / HORA_MS;

export type ResumenDescarga = {
  horasBombeo: number;
  /** Desde el primer inicio hasta el último fin. */
  horasTotales: number | null;
  /** Diferencia entre el tiempo total y el de bombeo. */
  horasPausa: number | null;
  /** Kilos ÷ horas de bombeo (kg/h). */
  rendimiento: number | null;
  /** Fin del último tramo: fecha a la que se atribuye la descarga. */
  fin: Date | null;
  variasBombas: boolean;
};

export function resumenDescarga(d: DescargaReporte): ResumenDescarga {
  const horasBombeo = horasDe(d.tramos);
  const cerrados = d.tramos.filter((t) => t.fin);
  const completa = cerrados.length === d.tramos.length && cerrados.length > 0;
  const inicio = Math.min(...d.tramos.map((t) => t.inicio.getTime()));
  const fin = completa ? Math.max(...cerrados.map((t) => t.fin!.getTime())) : null;
  const horasTotales = fin === null ? null : (fin - inicio) / HORA_MS;
  return {
    horasBombeo,
    horasTotales,
    horasPausa: horasTotales === null ? null : horasTotales - horasBombeo,
    rendimiento: d.toneladas && horasBombeo > 0 ? aKilos(d.toneladas) / horasBombeo : null,
    fin: fin === null ? null : new Date(fin),
    variasBombas: usaVariasBombas(d.tramos),
  };
}

export type ToneladasBomba = {
  bombaId: number;
  tipo: "DESCARGA" | "CARGA";
  kilos: number;
  horas: number;
  rendimiento: number | null;
  /** Incluye toneladas asignadas a mano por el Supervisor (descargas con más de una bomba). */
  asignacionManual: boolean;
  descargas: number;
};

/**
 * Kilos y rendimiento (kg/h) por bomba, separados por tipo de operación (sección 7 y 13).
 * - Una sola bomba: todos los kilos y horas de la descarga son de esa bomba (exacto).
 * - Varias bombas: solo cuentan los tramos con kilos asignados, con sus horas ("asignación manual").
 * Solo descargas finalizadas (con toneladas).
 */
export function toneladasPorBomba(descargas: readonly DescargaReporte[]): ToneladasBomba[] {
  const suma = new Map<string, ToneladasBomba>();
  const sumar = (bombaId: number, tipo: ToneladasBomba["tipo"], kilos: number, horas: number, manual: boolean, descargaId: number, contadas: Set<string>) => {
    const clave = `${bombaId}|${tipo}`;
    const actual = suma.get(clave) ?? { bombaId, tipo, kilos: 0, horas: 0, rendimiento: null, asignacionManual: false, descargas: 0 };
    actual.kilos += kilos;
    actual.horas += horas;
    actual.asignacionManual ||= manual;
    if (!contadas.has(`${clave}|${descargaId}`)) {
      actual.descargas += 1;
      contadas.add(`${clave}|${descargaId}`);
    }
    suma.set(clave, actual);
  };

  const contadas = new Set<string>();
  for (const d of descargas) {
    if (d.estado !== "FINALIZADA" || !d.toneladas || d.tramos.length === 0) continue;
    if (!usaVariasBombas(d.tramos)) {
      sumar(d.tramos[0]!.bombaId, d.tipo, aKilos(d.toneladas), horasDe(d.tramos), false, d.id, contadas);
      continue;
    }
    for (const t of d.tramos) {
      if (t.toneladas && t.fin) sumar(t.bombaId, d.tipo, aKilos(t.toneladas), horasDe([t]), true, d.id, contadas);
    }
  }
  return [...suma.values()]
    .map((b) => ({ ...b, rendimiento: b.horas > 0 ? b.kilos / b.horas : null }))
    .sort((a, b) => a.tipo.localeCompare(b.tipo) || a.bombaId - b.bombaId);
}

export type ToneladasPorClave = { id: number; descarga: number; carga: number };

/** Kilos por producto, proveedor o tanque, separadas por tipo. Solo finalizadas. */
export function toneladasPor(
  campo: "productoId" | "proveedorId" | "tanqueId",
  descargas: readonly DescargaReporte[],
): ToneladasPorClave[] {
  const suma = new Map<number, ToneladasPorClave>();
  for (const d of descargas) {
    if (d.estado !== "FINALIZADA" || !d.toneladas) continue;
    const id = d[campo];
    const actual = suma.get(id) ?? { id, descarga: 0, carga: 0 };
    if (d.tipo === "CARGA") actual.carga += aKilos(d.toneladas);
    else actual.descarga += aKilos(d.toneladas);
    suma.set(id, actual);
  }
  return [...suma.values()].sort((a, b) => b.descarga + b.carga - (a.descarga + a.carga));
}
