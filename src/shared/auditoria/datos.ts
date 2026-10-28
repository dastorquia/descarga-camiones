import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { etiquetaBomba } from "@/shared/catalogos/sector";
import { db } from "@/shared/lib/db";
import { desdeDiaHora } from "@/shared/lib/fechas";
import type { Nombres } from "./describir";
import { GRUPOS, type FiltrosAuditoria } from "./filtros";

export const POR_PAGINA = 30;

const comoObjeto = (v: unknown): Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

/** Nombres de todos los catálogos (también desactivados), para mostrar en lugar de ids. */
async function nombresCatalogos(): Promise<Required<Nombres>> {
  const [productos, proveedores, tanques, bombas, operarios] = await Promise.all([
    db.producto.findMany(),
    db.proveedor.findMany(),
    db.tanque.findMany(),
    db.bomba.findMany(),
    db.operario.findMany(),
  ]);
  return {
    productoId: Object.fromEntries(productos.map((x) => [x.id, x.nombre])),
    proveedorId: Object.fromEntries(proveedores.map((x) => [x.id, x.nombre])),
    tanqueId: Object.fromEntries(tanques.map((x) => [x.id, x.codigo])),
    bombaId: Object.fromEntries(bombas.map((x) => [x.id, etiquetaBomba(x.codigo, x.descripcion)])),
    operarioId: Object.fromEntries(operarios.map((x) => [x.id, x.nombre])),
  };
}

const CAMPO_DE_ENTIDAD: Record<string, keyof Nombres> = {
  Producto: "productoId",
  Proveedor: "proveedorId",
  Tanque: "tanqueId",
  Bomba: "bombaId",
  Operario: "operarioId",
};

export async function buscarAuditoria(f: FiltrosAuditoria) {
  const desde = f.desde ? desdeDiaHora(f.desde, "00:00") : null;
  const hastaDia = f.hasta ? desdeDiaHora(f.hasta, "00:00") : null;
  const hasta = hastaDia ? new Date(hastaDia.getTime() + 24 * 3_600_000) : null;

  let deLaDescarga: Prisma.AuditLogWhereInput | undefined;
  if (f.descargaId) {
    const tramos = await db.tramoBombeo.findMany({ where: { descargaId: f.descargaId }, select: { id: true } });
    deLaDescarga = {
      OR: [
        { entidad: "Descarga", entidadId: f.descargaId },
        {
          entidad: "TramoBombeo",
          OR: [
            { entidadId: { in: tramos.map((t) => t.id) } },
            { antes: { path: ["descargaId"], equals: f.descargaId } },
            { despues: { path: ["descargaId"], equals: f.descargaId } },
          ],
        },
      ],
    };
  }

  const where: Prisma.AuditLogWhereInput = {
    ...(f.grupo ? { entidad: { in: [...GRUPOS[f.grupo].entidades] } } : {}),
    ...(f.accion ? { accion: f.accion } : {}),
    ...(desde || hasta ? { fecha: { ...(desde ? { gte: desde } : {}), ...(hasta ? { lt: hasta } : {}) } } : {}),
    ...(deLaDescarga ?? {}),
  };

  const [total, filas, nombres] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({ where, orderBy: { id: "desc" }, skip: (f.pagina - 1) * POR_PAGINA, take: POR_PAGINA }),
    nombresCatalogos(),
  ]);

  // Descarga a la que pertenece cada registro (para el enlace y la hoja de ruta).
  const tramoIds = filas.filter((r) => r.entidad === "TramoBombeo").map((r) => r.entidadId);
  const tramos = await db.tramoBombeo.findMany({ where: { id: { in: tramoIds } }, select: { id: true, descargaId: true } });
  const descargaDe = (r: (typeof filas)[number]): number | null => {
    if (r.entidad === "Descarga") return r.entidadId;
    if (r.entidad !== "TramoBombeo") return null;
    const guardado = comoObjeto(r.despues).descargaId ?? comoObjeto(r.antes).descargaId;
    return typeof guardado === "number" ? guardado : (tramos.find((t) => t.id === r.entidadId)?.descargaId ?? null);
  };
  const descargaIds = [...new Set(filas.map(descargaDe).filter((x): x is number => x !== null))];
  const hojas = Object.fromEntries(
    (await db.descarga.findMany({ where: { id: { in: descargaIds } }, select: { id: true, hojaDeRuta: true } })).map((d) => [d.id, d.hojaDeRuta]),
  );

  return {
    total,
    paginas: Math.max(1, Math.ceil(total / POR_PAGINA)),
    nombres,
    registros: filas.map((r) => {
      const descargaId = descargaDe(r);
      const campo = CAMPO_DE_ENTIDAD[r.entidad];
      return {
        ...r,
        descargaId,
        hojaDeRuta: descargaId ? (hojas[descargaId] ?? null) : null,
        /** Nombre actual del elemento de catálogo, si corresponde. */
        nombreElemento: campo ? (nombres[campo][r.entidadId] ?? null) : null,
      };
    }),
  };
}
