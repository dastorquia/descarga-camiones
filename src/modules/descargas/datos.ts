import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/shared/lib/db";
import type { Filtros } from "./dominio/filtros";
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

export const POR_PAGINA = 25;

/**
 * Historial con filtros. El filtro de fechas toma las descargas que tuvieron
 * bombeo en ese período (algún tramo empezó entre "desde" y "hasta", inclusive).
 */
export async function buscarHistorial(f: Filtros) {
  const desde = f.desde ? desdeDiaHora(f.desde, "00:00") : null;
  const hastaDia = f.hasta ? desdeDiaHora(f.hasta, "00:00") : null;
  const hasta = hastaDia ? new Date(hastaDia.getTime() + 24 * 3_600_000) : null;

  const tramo: Prisma.TramoBombeoWhereInput = {
    ...(f.bombaId ? { bombaId: f.bombaId } : {}),
    ...(desde || hasta ? { inicio: { ...(desde ? { gte: desde } : {}), ...(hasta ? { lt: hasta } : {}) } } : {}),
  };
  const where: Prisma.DescargaWhereInput = {
    ...(f.estado ? { estado: f.estado } : {}),
    ...(f.tipo ? { tipo: f.tipo } : {}),
    ...(f.productoId ? { productoId: f.productoId } : {}),
    ...(f.proveedorId ? { proveedorId: f.proveedorId } : {}),
    ...(f.tanqueId ? { tanqueId: f.tanqueId } : {}),
    ...(f.texto ? { OR: [{ hojaDeRuta: { contains: f.texto } }, { patente: { contains: f.texto } }] } : {}),
    ...(Object.keys(tramo).length ? { tramos: { some: tramo } } : {}),
  };

  const [total, descargas] = await Promise.all([
    db.descarga.count({ where }),
    db.descarga.findMany({
      where,
      orderBy: { creadaEn: "desc" },
      skip: (f.pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
      include: conDetalle,
    }),
  ]);
  return { total, descargas, paginas: Math.max(1, Math.ceil(total / POR_PAGINA)) };
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
