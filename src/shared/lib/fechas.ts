// Fechas: en la base todo es UTC; en pantalla, hora de Argentina.
// En los formularios, día ("AAAA-MM-DD") y hora ("HH:MM") van en campos separados.

export const ZONA_ARGENTINA = "America/Argentina/Buenos_Aires";

export type DiaHora = { dia: string; hora: string };

const partesFormato = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_ARGENTINA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Día y hora de Argentina para un instante. */
export function aDiaHora(fecha: Date): DiaHora {
  const p = Object.fromEntries(partesFormato.formatToParts(fecha).map((x) => [x.type, x.value]));
  return { dia: `${p.year}-${p.month}-${p.day}`, hora: `${p.hour}:${p.minute}` };
}

/** Minutos de diferencia entre la hora de Argentina y UTC en ese instante (hoy: −180). */
function desfaseMinutos(instante: Date): number {
  const { dia, hora } = aDiaHora(instante);
  const comoUtc = Date.parse(`${dia}T${hora}:00Z`);
  const exacto = Math.floor(instante.getTime() / 60_000) * 60_000;
  return (comoUtc - exacto) / 60_000;
}

const RE_DIA = /^\d{4}-\d{2}-\d{2}$/;
const RE_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Convierte día y hora de Argentina a un instante UTC. Devuelve null si el formato no es válido. */
export function desdeDiaHora(dia: string, hora: string): Date | null {
  if (!RE_DIA.test(dia) || !RE_HORA.test(hora)) return null;
  const comoUtc = Date.parse(`${dia}T${hora}:00Z`);
  if (Number.isNaN(comoUtc)) return null;
  // Se corrige con el desfase real de la zona (contempla un eventual horario de verano).
  const primero = new Date(comoUtc - desfaseMinutos(new Date(comoUtc)) * 60_000);
  const resultado = new Date(comoUtc - desfaseMinutos(primero) * 60_000);
  // Rechaza fechas imposibles, como el 31 de febrero.
  const vuelta = aDiaHora(resultado);
  return vuelta.dia === dia && vuelta.hora === hora ? resultado : null;
}

const formatoFechaHora = new Intl.DateTimeFormat("es-AR", {
  timeZone: ZONA_ARGENTINA,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const formatoHora = new Intl.DateTimeFormat("es-AR", {
  timeZone: ZONA_ARGENTINA,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "28/10/2026 16:00" */
export function formatearFechaHora(fecha: Date): string {
  return formatoFechaHora.format(fecha).replace(",", "");
}

/** "16:00" */
export function formatearHora(fecha: Date): string {
  return formatoHora.format(fecha);
}

/** "28/10" a partir de "2026-10-28" */
export function formatearDiaCorto(dia: string): string {
  const [, mes, d] = dia.split("-");
  return `${d}/${mes}`;
}
