import "server-only";
import { db } from "@/shared/lib/db";

export type Opcion = { id: number; nombre: string };
export type OpcionBomba = { id: number; codigo: string; sector: string | null };

/** Catálogos activos para los desplegables (solo se eligen activos). */
export async function catalogosActivos() {
  const [productos, proveedores, tanques, bombas, operarios] = await Promise.all([
    db.producto.findMany({ where: { activo: true }, orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
    db.proveedor.findMany({ where: { activo: true }, orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
    db.tanque.findMany({ where: { activo: true }, orderBy: { codigo: "asc" }, select: { id: true, codigo: true } }),
    db.bomba.findMany({ where: { activa: true }, orderBy: { codigo: "asc" }, select: { id: true, codigo: true, descripcion: true } }),
    db.operario.findMany({ where: { activo: true }, orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
  ]);
  return {
    productos,
    proveedores,
    tanques: tanques.map((t) => ({ id: t.id, nombre: t.codigo })),
    bombas: bombas.map((b) => ({ id: b.id, codigo: b.codigo, sector: b.descripcion })),
    operarios,
  };
}

export type Catalogos = Awaited<ReturnType<typeof catalogosActivos>>;
