import "server-only";
import type { Tabla } from "@/modules/descargas/reportes/tabla";
import { etiquetaBomba } from "@/shared/catalogos/sector";
import { formatearFechaHora } from "@/shared/lib/fechas";
import { historialTareas, ultimasTareas } from "./datos";
import { LISTA_TAREAS, TAREAS } from "./tareas";

/** Mantenimiento autónomo como tablas de reporte: la última vez de cada tarea y el historial completo. */
export async function tablasAutonomo(bombaId: number | null): Promise<Tabla[]> {
  const [ultimas, historial] = await Promise.all([ultimasTareas(), historialTareas(bombaId, null)]);
  return [
    {
      id: "ultima_vez",
      titulo: "Última vez de cada tarea",
      hoja: "Última vez",
      columnas: [{ titulo: "Bomba", tipo: "texto" }, ...LISTA_TAREAS.map((t) => ({ titulo: TAREAS[t], tipo: "texto" as const }))],
      filas: ultimas.map((b) => [
        b.etiqueta,
        ...LISTA_TAREAS.map((t) => {
          const u = b.ultima.get(t);
          return u ? `${formatearFechaHora(u.fecha)} (${u.operario})` : "Nunca";
        }),
      ]),
    },
    {
      id: "historial",
      titulo: "Historial de mantenimiento autónomo",
      hoja: "Historial",
      columnas: [
        { titulo: "Día y hora", tipo: "texto" },
        { titulo: "Bomba", tipo: "texto" },
        { titulo: "Tarea", tipo: "texto" },
        { titulo: "Colaborador", tipo: "texto" },
        { titulo: "Observaciones", tipo: "texto" },
      ],
      filas: historial.map((t) => [
        formatearFechaHora(t.fecha),
        etiquetaBomba(t.bomba.codigo, t.bomba.descripcion),
        TAREAS[t.tarea],
        t.operario.nombre,
        t.observaciones,
      ]),
    },
  ];
}
