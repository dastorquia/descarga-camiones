import "server-only";
import { db } from "@/shared/lib/db";
import { aDiaHora, desdeDiaHora } from "@/shared/lib/fechas";

// Lecturas de descargas para las pantallas.

const conDetalle = {
  producto: { select: { nombre: true } },
  proveedor: { select: { nombre: true } },
  tanque: { select: { codigo: true } },
  tramos: {
    orderBy: { inicio: "asc" },
    include: {
      bomba: { select: { id: true, codigo: true, descripcion: true } },
      operario: { select: { id: true, nombre: true } },
    },
  },
} as const;

/** Descargas en curso y pausadas, para el inicio del Colaborador. */
export async function descargasActivas() {
  return db.descarga.findMany({
    where: { estado: { in: ["EN_CURSO", "PAUSADA"] } },
    orderBy: { creadaEn: "desc" },
    include: conDetalle,
  });
}

/** Finalizadas cuyo último tramo terminó hoy (día de Argentina). */
export async function descargasFinalizadasHoy() {
  const inicioDeHoy = desdeDiaHora(aDiaHora(new Date()).dia, "00:00");
  if (!inicioDeHoy) return [];
  const candidatas = await db.descarga.findMany({
    where: { estado: "FINALIZADA", tramos: { some: { fin: { gte: inicioDeHoy } } } },
    include: conDetalle,
  });
  const fin = (d: (typeof candidatas)[number]) => Math.max(...d.tramos.map((t) => t.fin?.getTime() ?? 0));
  return candidatas.filter((d) => fin(d) >= inicioDeHoy.getTime()).sort((a, b) => fin(b) - fin(a));
}

export async function detalleDescarga(id: number) {
  return db.descarga.findUnique({ where: { id }, include: conDetalle });
}

export type DescargaConDetalle = NonNullable<Awaited<ReturnType<typeof detalleDescarga>>>;

/** Bombas con un tramo abierto, y en qué descarga. */
export async function bombasOcupadas(): Promise<Map<number, string>> {
  const abiertos = await db.tramoBombeo.findMany({
    where: { fin: null },
    select: { bombaId: true, descarga: { select: { hojaDeRuta: true } } },
  });
  return new Map(abiertos.map((t) => [t.bombaId, t.descarga.hojaDeRuta]));
}
