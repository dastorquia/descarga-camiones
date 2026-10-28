"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { exigirPermiso } from "@/shared/auth/sesion";
import { leerUmbrales } from "@/shared/config/leer";
import { db } from "@/shared/lib/db";
import { errorAlAbrir, errorAlCerrar, normalizarHojaDeRuta, normalizarPatente, operacionPermitida, type Operacion } from "./dominio/reglas";
import { advertenciaToneladas, interpretarToneladas } from "./dominio/toneladas";
import { esquemaCerrarTramo, esquemaFinalizar, esquemaNuevaDescarga, esquemaReanudar } from "./esquemas";
import { ErrorNegocio, exigirActivos, exigirBombaLibre, instante, leer, mensajeDeError } from "./servidor";

/** `confirmar`: valor de toneladas advertido; reenviarlo igual lo confirma. */
export type EstadoAccion = { error?: string; advertencia?: string; confirmar?: string };

const NOMBRE_OPERACION: Record<Operacion, string> = { pausar: "pausar", reanudar: "reanudar", finalizar: "finalizar" };

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
    const patente = normalizarPatente(datos.patente);
    if (!patente.ok) throw new ErrorNegocio(patente.error);
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
          patente: patente.valor,
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
