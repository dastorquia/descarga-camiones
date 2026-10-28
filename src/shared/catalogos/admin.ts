import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/shared/lib/db";
import type { Catalogo } from "./validacion";

// Acceso a los cinco catálogos con una forma común: { id, valor, sector, activo }.
// "valor" es el código (bombas, tanques) o el nombre (el resto).

export type ItemCatalogo = { id: number; valor: string; sector: string | null; activo: boolean };

type Datos = { valor: string; sector?: string | null };
type Tx = Prisma.TransactionClient;

export const ENTIDAD: Record<Catalogo, string> = {
  bombas: "Bomba",
  tanques: "Tanque",
  productos: "Producto",
  proveedores: "Proveedor",
  operarios: "Operario",
};

export async function listarCatalogo(catalogo: Catalogo): Promise<ItemCatalogo[]> {
  switch (catalogo) {
    case "bombas":
      return (await db.bomba.findMany({ orderBy: [{ descripcion: "asc" }, { codigo: "asc" }] })).map((b) => ({
        id: b.id,
        valor: b.codigo,
        sector: b.descripcion,
        activo: b.activa,
      }));
    case "tanques":
      return (await db.tanque.findMany({ orderBy: { codigo: "asc" } })).map((t) => ({ id: t.id, valor: t.codigo, sector: null, activo: t.activo }));
    case "productos":
      return (await db.producto.findMany({ orderBy: { nombre: "asc" } })).map((p) => ({ id: p.id, valor: p.nombre, sector: null, activo: p.activo }));
    case "proveedores":
      return (await db.proveedor.findMany({ orderBy: { nombre: "asc" } })).map((p) => ({ id: p.id, valor: p.nombre, sector: null, activo: p.activo }));
    case "operarios":
      return (await db.operario.findMany({ orderBy: { nombre: "asc" } })).map((o) => ({ id: o.id, valor: o.nombre, sector: null, activo: o.activo }));
  }
}

export async function leerItem(tx: Tx, catalogo: Catalogo, id: number): Promise<ItemCatalogo | null> {
  switch (catalogo) {
    case "bombas": {
      const b = await tx.bomba.findUnique({ where: { id } });
      return b && { id: b.id, valor: b.codigo, sector: b.descripcion, activo: b.activa };
    }
    case "tanques": {
      const t = await tx.tanque.findUnique({ where: { id } });
      return t && { id: t.id, valor: t.codigo, sector: null, activo: t.activo };
    }
    case "productos": {
      const p = await tx.producto.findUnique({ where: { id } });
      return p && { id: p.id, valor: p.nombre, sector: null, activo: p.activo };
    }
    case "proveedores": {
      const p = await tx.proveedor.findUnique({ where: { id } });
      return p && { id: p.id, valor: p.nombre, sector: null, activo: p.activo };
    }
    case "operarios": {
      const o = await tx.operario.findUnique({ where: { id } });
      return o && { id: o.id, valor: o.nombre, sector: null, activo: o.activo };
    }
  }
}

/** ¿Hay otro elemento con el mismo valor, sin distinguir mayúsculas? ("aceite" = "Aceite") */
export async function existeOtro(tx: Tx, catalogo: Catalogo, valor: string, excluirId: number): Promise<boolean> {
  const igual = { equals: valor, mode: "insensitive" as const };
  const otro = { not: excluirId };
  switch (catalogo) {
    case "bombas":
      return (await tx.bomba.count({ where: { codigo: igual, id: otro } })) > 0;
    case "tanques":
      return (await tx.tanque.count({ where: { codigo: igual, id: otro } })) > 0;
    case "productos":
      return (await tx.producto.count({ where: { nombre: igual, id: otro } })) > 0;
    case "proveedores":
      return (await tx.proveedor.count({ where: { nombre: igual, id: otro } })) > 0;
    case "operarios":
      return (await tx.operario.count({ where: { nombre: igual, id: otro } })) > 0;
  }
}

export async function crearItem(tx: Tx, catalogo: Catalogo, d: Datos): Promise<number> {
  switch (catalogo) {
    case "bombas":
      return (await tx.bomba.create({ data: { codigo: d.valor, descripcion: d.sector || null } })).id;
    case "tanques":
      return (await tx.tanque.create({ data: { codigo: d.valor } })).id;
    case "productos":
      return (await tx.producto.create({ data: { nombre: d.valor } })).id;
    case "proveedores":
      return (await tx.proveedor.create({ data: { nombre: d.valor } })).id;
    case "operarios":
      return (await tx.operario.create({ data: { nombre: d.valor } })).id;
  }
}

export async function actualizarItem(tx: Tx, catalogo: Catalogo, id: number, d: Datos & { activo?: boolean }) {
  switch (catalogo) {
    case "bombas":
      await tx.bomba.update({
        where: { id },
        data: { codigo: d.valor, descripcion: d.sector === undefined ? undefined : d.sector || null, activa: d.activo },
      });
      return;
    case "tanques":
      await tx.tanque.update({ where: { id }, data: { codigo: d.valor, activo: d.activo } });
      return;
    case "productos":
      await tx.producto.update({ where: { id }, data: { nombre: d.valor, activo: d.activo } });
      return;
    case "proveedores":
      await tx.proveedor.update({ where: { id }, data: { nombre: d.valor, activo: d.activo } });
      return;
    case "operarios":
      await tx.operario.update({ where: { id }, data: { nombre: d.valor, activo: d.activo } });
      return;
  }
}
