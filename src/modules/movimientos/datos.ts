import "server-only";
import type { Rango } from "@/modules/descargas/dominio/reportes";
import { db } from "@/shared/lib/db";
import { intervalosDeMovimiento } from "./reglas";

/** Intervalos de bomba de los movimientos que tocan el período (se suman a las horas de uso). */
export async function intervalosMovimientos(rango: Rango) {
  const movimientos = await db.movimientoInterno.findMany({
    where: { inicio: { lt: rango.hasta }, fin: { gt: rango.desde } },
    select: { inicio: true, fin: true, bombaCargaId: true, bombaDescargaId: true },
  });
  return movimientos.flatMap(intervalosDeMovimiento);
}

/** Movimientos que empezaron en el período, para la tabla del Supervisor. */
export async function movimientosDelPeriodo(rango: Rango) {
  return db.movimientoInterno.findMany({
    where: { inicio: { gte: rango.desde, lt: rango.hasta } },
    orderBy: { inicio: "desc" },
    include: {
      tanqueOrigen: { select: { codigo: true } },
      tanqueDestino: { select: { codigo: true } },
      bombaCarga: { select: { codigo: true, descripcion: true } },
      bombaDescarga: { select: { codigo: true, descripcion: true } },
      operario: { select: { nombre: true } },
    },
  });
}
