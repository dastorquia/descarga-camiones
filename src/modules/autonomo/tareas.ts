// Tareas de mantenimiento autónomo (sección 13, 29/10/2026).

export const TAREAS = {
  INSPECCION_CUERPO: "Inspección del cuerpo de la bomba",
  INSPECCION_SKID: "Inspección del skid de la bomba",
  LIMPIEZA: "Limpieza",
  AJUSTE_PRENSAESTOPAS: "Ajuste de prensaestopas",
} as const;

export type Tarea = keyof typeof TAREAS;

export const LISTA_TAREAS = Object.keys(TAREAS) as Tarea[];

export function esTarea(valor: unknown): valor is Tarea {
  return typeof valor === "string" && Object.hasOwn(TAREAS, valor);
}
