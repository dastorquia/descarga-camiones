import "server-only";
import type { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { desdeDiaHora } from "@/shared/lib/fechas";
import { tramoSolapado } from "./dominio/reglas";

// Ayudas comunes de las acciones de descargas (flujo y edición).

/** Error de negocio con un mensaje para mostrar tal cual. */
export class ErrorNegocio extends Error {}

export function leer<T extends z.ZodType>(esquema: T, formulario: FormData): z.infer<T> {
  const datos = esquema.safeParse(Object.fromEntries(formulario));
  if (!datos.success) throw new ErrorNegocio(datos.error.issues[0]?.message ?? "Revisá los datos.");
  return datos.data;
}

export function instante(dia: string, hora: string): Date {
  const fecha = desdeDiaHora(dia, hora);
  if (!fecha) throw new ErrorNegocio("El día o la hora no son válidos.");
  return fecha;
}

/** Traduce errores de la base a mensajes claros. */
export function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorNegocio) return error.message;
  const texto = JSON.stringify((error as { meta?: unknown })?.meta ?? "");
  if (texto.includes("Descarga_hojaDeRuta_key")) return "Ya existe una descarga con esa hoja de ruta.";
  if (texto.includes("TramoBombeo_bomba_sin_solape")) return "La bomba ya está en uso en ese horario.";
  if (texto.includes("TramoBombeo_descarga_sin_solape")) return "Los horarios se superponen con otro tramo de esta descarga.";
  if (texto.includes("TramoBombeo_fin_posterior_inicio")) return "La hora de fin tiene que ser posterior al inicio.";
  console.error(error);
  return "No se pudo guardar. Probá de nuevo.";
}

type IdsCatalogo = { productoId?: number; proveedorId?: number; tanqueId?: number; bombaId?: number; operarioId?: number };

/** Exige que los elementos de catálogo elegidos estén activos (sección 5). */
export async function exigirActivos(tx: Prisma.TransactionClient, ids: IdsCatalogo) {
  const controles: [Promise<unknown>, string][] = [];
  if (ids.productoId) controles.push([tx.producto.findFirst({ where: { id: ids.productoId, activo: true } }), "El producto"]);
  if (ids.proveedorId) controles.push([tx.proveedor.findFirst({ where: { id: ids.proveedorId, activo: true } }), "El proveedor o cliente"]);
  if (ids.tanqueId) controles.push([tx.tanque.findFirst({ where: { id: ids.tanqueId, activo: true } }), "El tanque"]);
  if (ids.bombaId) controles.push([tx.bomba.findFirst({ where: { id: ids.bombaId, activa: true } }), "La bomba"]);
  if (ids.operarioId) controles.push([tx.operario.findFirst({ where: { id: ids.operarioId, activo: true } }), "El operario"]);
  const resultados = await Promise.all(controles.map(([p]) => p));
  const faltante = resultados.findIndex((r) => r === null);
  if (faltante >= 0) throw new ErrorNegocio(`${controles[faltante]![1]} elegido no está disponible. Elegí otro.`);
}

/**
 * Verifica que la bomba esté libre en [inicio, fin) (fin null = abierto),
 * sin contar los tramos de `excluirDescargaId` (la descarga que se edita).
 */
export async function exigirBombaLibre(
  tx: Prisma.TransactionClient,
  bombaId: number,
  inicio: Date,
  fin: Date | null = null,
  excluirDescargaId?: number,
) {
  const tramos = await tx.tramoBombeo.findMany({
    where: {
      bombaId,
      OR: [{ fin: null }, { fin: { gt: inicio } }],
      ...(fin ? { inicio: { lt: fin } } : {}),
      ...(excluirDescargaId ? { descargaId: { not: excluirDescargaId } } : {}),
    },
    include: { descarga: { select: { hojaDeRuta: true } }, bomba: { select: { codigo: true } } },
  });
  const choque = tramoSolapado({ inicio, fin }, tramos);
  if (choque) {
    throw new ErrorNegocio(
      `La bomba ${choque.bomba.codigo} está en uso en ese horario (hoja de ruta ${choque.descarga.hojaDeRuta}).`,
    );
  }
}
