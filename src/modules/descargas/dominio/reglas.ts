import type { Intervalo } from "./horas";

// Reglas de negocio de los tramos (secciones 5 y 13). Funciones puras:
// las acciones del servidor les pasan los datos ya leídos de la base.

/** Tolerancia para horas "futuras" (relojes de celular un poco adelantados). */
export const TOLERANCIA_FUTURO_MS = 5 * 60_000;

export type Estado = "EN_CURSO" | "PAUSADA" | "FINALIZADA";
export type Operacion = "pausar" | "reanudar" | "finalizar";

/** Estados desde los que se permite cada operación. */
const PERMITIDO: Record<Operacion, readonly Estado[]> = {
  pausar: ["EN_CURSO"],
  reanudar: ["PAUSADA"],
  finalizar: ["EN_CURSO", "PAUSADA"],
};

export function operacionPermitida(estado: Estado, operacion: Operacion): boolean {
  return PERMITIDO[operacion].includes(estado);
}

/** Hoja de ruta: sin espacios, en mayúsculas, solo letras y números. */
export function normalizarHojaDeRuta(texto: string): { ok: true; valor: string } | { ok: false; error: string } {
  const valor = texto.replace(/\s/g, "").toUpperCase();
  if (valor === "") return { ok: false, error: "Cargá la hoja de ruta." };
  if (!/^[A-Z0-9]+$/.test(valor)) {
    return { ok: false, error: "La hoja de ruta lleva solo letras y números, sin guiones ni símbolos." };
  }
  if (valor.length > 30) return { ok: false, error: "La hoja de ruta es demasiado larga." };
  return { ok: true, valor };
}

export const LARGO_MAXIMO_PATENTE = 15;

/**
 * Patente obligatoria "camión/acoplado" (sección 13): AB123CD/AC456EF. El acoplado
 * es opcional. Cada patente lleva de 5 a 8 letras y números (admite patentes de
 * otros países); hasta 15 caracteres en total.
 */
export function normalizarPatente(texto: string): { ok: true; valor: string } | { ok: false; error: string } {
  const valor = texto.replace(/\s/g, "").toUpperCase().replace(/\/+$/, "");
  if (valor === "") return { ok: false, error: "Cargá la patente." };
  if (!/^[A-Z0-9/]+$/.test(valor)) {
    return { ok: false, error: "La patente lleva solo letras y números, y una barra entre camión y acoplado." };
  }
  if (valor.length > LARGO_MAXIMO_PATENTE) return { ok: false, error: "La patente es demasiado larga (máximo 15 caracteres)." };
  if (!/^[A-Z0-9]{5,8}(\/[A-Z0-9]{5,8})?$/.test(valor)) {
    return { ok: false, error: "Escribí la patente del camión y la del acoplado separadas por una barra, por ejemplo AB123CD/AC456EF." };
  }
  return { ok: true, valor };
}

/** Patente argentina completa: vieja (ABC123) o Mercosur (AB123CD). */
const PATENTE_COMPLETA = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;

/**
 * Formatea la patente mientras se escribe: mayúsculas, solo letras, números y una barra,
 * y agrega la barra sola cuando la patente del camión queda completa. Solo agrega la
 * barra si el texto creció (así se puede borrar sin que vuelva a aparecer).
 */
export function formatearPatenteAlEscribir(nuevo: string, anterior: string): string {
  let texto = nuevo.toUpperCase().replace(/[^A-Z0-9/]/g, "");
  // Una sola barra.
  const barra = texto.indexOf("/");
  if (barra >= 0) texto = texto.slice(0, barra + 1) + texto.slice(barra + 1).replace(/\//g, "");
  if (barra < 0 && texto.length > anterior.length) {
    for (const largo of [6, 7]) {
      const camion = texto.slice(0, largo);
      if (texto.length >= largo && PATENTE_COMPLETA.test(camion)) {
        texto = `${camion}/${texto.slice(largo)}`;
        break;
      }
    }
  }
  return texto.slice(0, LARGO_MAXIMO_PATENTE);
}

export function esFuturo(fecha: Date, ahora: Date): boolean {
  return fecha.getTime() > ahora.getTime() + TOLERANCIA_FUTURO_MS;
}

function seSolapan(a: Intervalo, b: Intervalo): boolean {
  const finA = a.fin?.getTime() ?? Infinity;
  const finB = b.fin?.getTime() ?? Infinity;
  return a.inicio.getTime() < finB && b.inicio.getTime() < finA;
}

/** Primer tramo de la lista que se superpone con el intervalo, o undefined. */
export function tramoSolapado<T extends Intervalo>(intervalo: Intervalo, tramos: readonly T[]): T | undefined {
  return tramos.find((t) => seSolapan(intervalo, t));
}

/** Error al cerrar un tramo (pausar o finalizar), o null si está bien. */
export function errorAlCerrar(tramo: Intervalo, fin: Date, ahora: Date): string | null {
  if (fin.getTime() <= tramo.inicio.getTime()) return "La hora de fin tiene que ser posterior al inicio del tramo.";
  if (esFuturo(fin, ahora)) return "La hora de fin no puede ser futura.";
  return null;
}

/** Error al abrir un tramo nuevo en una descarga (iniciar o reanudar), o null. */
export function errorAlAbrir(inicio: Date, tramosDeLaDescarga: readonly Intervalo[], ahora: Date): string | null {
  if (esFuturo(inicio, ahora)) return "La hora de inicio no puede ser futura.";
  if (tramosDeLaDescarga.some((t) => t.fin === null)) return "La descarga ya tiene un tramo en curso.";
  const ultimoFin = Math.max(...tramosDeLaDescarga.map((t) => t.fin?.getTime() ?? 0), 0);
  if (inicio.getTime() < ultimoFin) {
    return "El nuevo tramo tiene que empezar después del fin del tramo anterior.";
  }
  return null;
}
