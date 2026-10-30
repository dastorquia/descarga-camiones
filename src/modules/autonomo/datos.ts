import "server-only";
import { etiquetaBomba } from "@/shared/catalogos/sector";
import { db } from "@/shared/lib/db";
import type { Tarea } from "./tareas";

/** Bombas activas marcadas para mantenimiento autónomo. */
export async function bombasConAutonomo() {
  const filas = await db.bombaAutonomo.findMany({
    where: { bomba: { activa: true } },
    include: { bomba: { select: { id: true, codigo: true, descripcion: true } } },
  });
  return filas
    .map((f) => ({ id: f.bomba.id, codigo: f.bomba.codigo, etiqueta: etiquetaBomba(f.bomba.codigo, f.bomba.descripcion) }))
    .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta));
}

/** Para el Supervisor: la última vez que se hizo cada tarea en cada bomba, y quién. */
export async function ultimasTareas() {
  const [bombas, tareas] = await Promise.all([
    bombasConAutonomo(),
    db.tareaAutonoma.findMany({ orderBy: { fecha: "desc" }, include: { operario: { select: { nombre: true } } } }),
  ]);
  return bombas.map((b) => {
    const ultima = new Map<Tarea, { fecha: Date; operario: string }>();
    for (const t of tareas) {
      if (t.bombaId === b.id && !ultima.has(t.tarea)) ultima.set(t.tarea, { fecha: t.fecha, operario: t.operario.nombre });
    }
    return { ...b, ultima };
  });
}

/** Historial de tareas, las más recientes primero. `limite` null = todas (para exportar). */
export async function historialTareas(bombaId: number | null, limite: number | null = 100) {
  return db.tareaAutonoma.findMany({
    where: bombaId ? { bombaId } : {},
    orderBy: { fecha: "desc" },
    ...(limite ? { take: limite } : {}),
    include: { bomba: { select: { codigo: true, descripcion: true } }, operario: { select: { nombre: true } } },
  });
}
