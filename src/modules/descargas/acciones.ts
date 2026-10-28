"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { exigirPermiso } from "@/shared/auth/sesion";
import { leerUmbrales } from "@/shared/config/leer";
import { db } from "@/shared/lib/db";
import { desdeDiaHora } from "@/shared/lib/fechas";
import { errorAlAbrir, errorAlCerrar, normalizarHojaDeRuta, normalizarPatente, operacionPermitida, tramoSolapado, type Operacion } from "./dominio/reglas";
import { advertenciaToneladas, interpretarToneladas } from "./dominio/toneladas";
import { esquemaCerrarTramo, esquemaFinalizar, esquemaNuevaDescarga, esquemaReanudar } from "./esquemas";

/** `confirmar`: valor de toneladas advertido; reenviarlo igual lo confirma. */
export type EstadoAccion = { error?: string; advertencia?: string; confirmar?: string };

/** Error de negocio con un mensaje para mostrar tal cual. */
class ErrorNegocio extends Error {}

const NOMBRE_OPERACION: Record<Operacion, string> = { pausar: "pausar", reanudar: "reanudar", finalizar: "finalizar" };

function leer<T extends z.ZodType>(esquema: T, formulario: FormData): z.infer<T> {
  const datos = esquema.safeParse(Object.fromEntries(formulario));
  if (!datos.success) throw new ErrorNegocio(datos.error.issues[0]?.message ?? "Revisá los datos.");
  return datos.data;
}

function instante(dia: string, hora: string): Date {
  const fecha = desdeDiaHora(dia, hora);
  if (!fecha) throw new ErrorNegocio("El día o la hora no son válidos.");
  return fecha;
}

/** Traduce errores de la base a mensajes claros. */
function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorNegocio) return error.message;
  const texto = JSON.stringify((error as { meta?: unknown })?.meta ?? "");
  if (texto.includes("Descarga_hojaDeRuta_key")) return "Ya existe una descarga con esa hoja de ruta.";
  if (texto.includes("TramoBombeo_bomba_sin_solape")) return "La bomba ya está en uso en ese horario.";
  if (texto.includes("TramoBombeo_descarga_sin_solape")) return "Los horarios se superponen con otro tramo de esta descarga.";
  if (texto.includes("TramoBombeo_fin_posterior_inicio")) return "La hora de fin tiene que ser posterior al inicio.";
  console.error(error);
  return "No se pudo guardar. Probá de nuevo.";
}

async function exigirActivos(
  tx: Prisma.TransactionClient,
  ids: { productoId?: number; proveedorId?: number; tanqueId?: number; bombaId?: number; operarioId?: number },
) {
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

/** Verifica que la bomba esté libre desde `inicio` (tramo abierto, sin fin). */
async function exigirBombaLibre(tx: Prisma.TransactionClient, bombaId: number, inicio: Date) {
  const tramos = await tx.tramoBombeo.findMany({
    where: { bombaId, OR: [{ fin: null }, { fin: { gt: inicio } }] },
    include: { descarga: { select: { hojaDeRuta: true } }, bomba: { select: { codigo: true } } },
  });
  const choque = tramoSolapado({ inicio, fin: null }, tramos);
  if (choque) {
    throw new ErrorNegocio(
      `La bomba ${choque.bomba.codigo} está en uso en ese horario (hoja de ruta ${choque.descarga.hojaDeRuta}).`,
    );
  }
}

async function leerDescarga(tx: Prisma.TransactionClient, id: number, operacion: Operacion) {
  const descarga = await tx.descarga.findUnique({ where: { id }, include: { tramos: { orderBy: { inicio: "asc" } } } });
  if (!descarga) throw new ErrorNegocio("La descarga no existe.");
  if (!operacionPermitida(descarga.estado, operacion)) {
    throw new ErrorNegocio(
      descarga.estado === "FINALIZADA"
        ? "La descarga ya está finalizada."
        : `No se puede ${NOMBRE_OPERACION[operacion]} una descarga ${descarga.estado === "EN_CURSO" ? "en curso" : "pausada"}.`,
    );
  }
  return descarga;
}

/** Cambia el estado solo si nadie lo cambió mientras tanto (dos celulares a la vez). */
async function cambiarEstado(
  tx: Prisma.TransactionClient,
  id: number,
  desde: "EN_CURSO" | "PAUSADA",
  datos: Prisma.DescargaUpdateManyMutationInput,
) {
  const { count } = await tx.descarga.updateMany({ where: { id, estado: desde }, data: datos });
  if (count !== 1) throw new ErrorNegocio("Alguien más modificó esta descarga. Volvé a cargar la pantalla.");
}

async function cerrarTramoAbierto(tx: Prisma.TransactionClient, tramos: { id: number; inicio: Date; fin: Date | null }[], fin: Date) {
  const abierto = tramos.find((t) => t.fin === null);
  if (!abierto) throw new ErrorNegocio("La descarga no tiene un tramo en curso.");
  const error = errorAlCerrar(abierto, fin, new Date());
  if (error) throw new ErrorNegocio(error);
  await tx.tramoBombeo.update({ where: { id: abierto.id }, data: { fin } });
}

function refrescar(id?: number) {
  revalidatePath("/colaborador");
  if (id) revalidatePath(`/colaborador/descargas/${id}`);
}

export async function iniciarDescarga(_previo: EstadoAccion, formulario: FormData): Promise<EstadoAccion> {
  await exigirPermiso("descargas.operar");
  let id: number;
  try {
    const datos = leer(esquemaNuevaDescarga, formulario);
    const hoja = normalizarHojaDeRuta(datos.hojaDeRuta);
    if (!hoja.ok) throw new ErrorNegocio(hoja.error);
    const inicio = instante(datos.dia, datos.hora);
    const error = errorAlAbrir(inicio, [], new Date());
    if (error) throw new ErrorNegocio(error);

    id = await db.$transaction(async (tx) => {
      await exigirActivos(tx, datos);
      if (await tx.descarga.findUnique({ where: { hojaDeRuta: hoja.valor } })) {
        throw new ErrorNegocio(`Ya existe una descarga con la hoja de ruta ${hoja.valor}.`);
      }
      await exigirBombaLibre(tx, datos.bombaId, inicio);
      const creada = await tx.descarga.create({
        data: {
          tipo: datos.tipo,
          hojaDeRuta: hoja.valor,
          patente: normalizarPatente(datos.patente),
          productoId: datos.productoId,
          proveedorId: datos.proveedorId,
          tanqueId: datos.tanqueId,
          observaciones: datos.observaciones.trim() || null,
          estado: "EN_CURSO",
          tramos: { create: { bombaId: datos.bombaId, operarioId: datos.operarioId, inicio } },
        },
      });
      return creada.id;
    });
  } catch (error) {
    return { error: mensajeDeError(error) };
  }
  refrescar(id);
  redirect(`/colaborador/descargas/${id}`);
}

export async function pausarDescarga(_previo: EstadoAccion, formulario: FormData): Promise<EstadoAccion> {
  await exigirPermiso("descargas.operar");
  let id: number;
  try {
    const datos = leer(esquemaCerrarTramo, formulario);
    id = datos.descargaId;
    const fin = instante(datos.dia, datos.hora);
    await db.$transaction(async (tx) => {
      const descarga = await leerDescarga(tx, datos.descargaId, "pausar");
      await cerrarTramoAbierto(tx, descarga.tramos, fin);
      await cambiarEstado(tx, descarga.id, "EN_CURSO", { estado: "PAUSADA" });
    });
  } catch (error) {
    return { error: mensajeDeError(error) };
  }
  refrescar(id);
  redirect(`/colaborador/descargas/${id}`);
}

export async function reanudarDescarga(_previo: EstadoAccion, formulario: FormData): Promise<EstadoAccion> {
  await exigirPermiso("descargas.operar");
  let id: number;
  try {
    const datos = leer(esquemaReanudar, formulario);
    id = datos.descargaId;
    const inicio = instante(datos.dia, datos.hora);
    await db.$transaction(async (tx) => {
      const descarga = await leerDescarga(tx, datos.descargaId, "reanudar");
      const error = errorAlAbrir(inicio, descarga.tramos, new Date());
      if (error) throw new ErrorNegocio(error);
      await exigirActivos(tx, { bombaId: datos.bombaId, operarioId: datos.operarioId });
      await exigirBombaLibre(tx, datos.bombaId, inicio);
      await tx.tramoBombeo.create({
        data: { descargaId: descarga.id, bombaId: datos.bombaId, operarioId: datos.operarioId, inicio },
      });
      await cambiarEstado(tx, descarga.id, "PAUSADA", { estado: "EN_CURSO" });
    });
  } catch (error) {
    return { error: mensajeDeError(error) };
  }
  refrescar(id);
  redirect(`/colaborador/descargas/${id}`);
}

export async function finalizarDescarga(_previo: EstadoAccion, formulario: FormData): Promise<EstadoAccion> {
  await exigirPermiso("descargas.operar");
  let id: number;
  try {
    const datos = leer(esquemaFinalizar, formulario);
    id = datos.descargaId;
    const toneladas = interpretarToneladas(datos.toneladas);
    if (!toneladas.ok) throw new ErrorNegocio(toneladas.error);

    // La advertencia no bloquea: si se reenvía el mismo valor advertido, se acepta.
    if (datos.confirmado !== datos.toneladas) {
      const { toneladasMin, toneladasMax } = await leerUmbrales();
      const advertencia = advertenciaToneladas(toneladas.valor, toneladasMin, toneladasMax);
      if (advertencia) return { advertencia, confirmar: datos.toneladas };
    }

    await db.$transaction(async (tx) => {
      const descarga = await leerDescarga(tx, datos.descargaId, "finalizar");
      if (descarga.estado === "EN_CURSO") {
        if (!datos.dia || !datos.hora) throw new ErrorNegocio("Elegí el día y la hora de fin.");
        await cerrarTramoAbierto(tx, descarga.tramos, instante(datos.dia, datos.hora));
      }
      await cambiarEstado(tx, descarga.id, descarga.estado as "EN_CURSO" | "PAUSADA", {
        estado: "FINALIZADA",
        toneladas: toneladas.valor,
      });
    });
  } catch (error) {
    return { error: mensajeDeError(error) };
  }
  refrescar(id);
  redirect(`/colaborador/descargas/${id}`);
}
