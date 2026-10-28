import "server-only";
import { db } from "@/shared/lib/db";

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
