"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { registrarAuditoria } from "@/shared/auditoria/registrar";
import { puede, type Perfil } from "@/shared/auth/perfiles";
import { exigirPermiso } from "@/shared/auth/sesion";
import { db } from "@/shared/lib/db";
import { efectoDeQuitar, errorEnAsignacion, errorEnTramos, usaVariasBombas } from "./dominio/edicion";
import { normalizarHojaDeRuta, normalizarPatente } from "./dominio/reglas";
import { interpretarKilos } from "./dominio/toneladas";
import { esquemaAgregarTramo, esquemaEditarDatos, esquemaEditarTramo } from "./esquemas";
import { ErrorNegocio, exigirActivos, exigirBombaLibre, exigirBombaSinMantenimiento, instante, leer, mensajeDeError } from "./servidor";

// Edición de registros (Etapa 5). El Colaborador edita mientras la descarga no
// esté finalizada; el Supervisor, siempre. Todo cambio queda en AuditLog.

export type EstadoEdicion = { error?: string; exito?: string };

async function leerEditable(tx: Prisma.TransactionClient, id: number, perfil: Perfil) {
  const descarga = await tx.descarga.findUnique({ where: { id }, include: { tramos: { orderBy: { inicio: "asc" } } } });
  if (!descarga) throw new ErrorNegocio("La descarga no existe.");
  if (descarga.estado === "FINALIZADA" && !puede(perfil, "descargas.editarFinalizadas")) {
    throw new ErrorNegocio("La descarga está finalizada. Solo el Supervisor puede corregirla.");
  }
  return descarga;
}

/** Solo exige "activo" para lo que se cambió: se puede conservar un elemento ya desactivado. */
function cambiados<T extends Record<string, unknown>>(antes: T, despues: Partial<T>): Partial<T> {
  return Object.fromEntries(Object.entries(despues).filter(([k, v]) => antes[k] !== v)) as Partial<T>;
}

function refrescar(id: number) {
  revalidatePath("/colaborador");
  revalidatePath(`/colaborador/descargas/${id}`);
  revalidatePath("/supervisor");
}

export async function editarDatosGenerales(_previo: EstadoEdicion, formulario: FormData): Promise<EstadoEdicion> {
  const { perfil } = await exigirPermiso("descargas.operar");
  let id = 0;
  try {
    const datos = leer(esquemaEditarDatos, formulario);
    id = datos.descargaId;
    const hoja = normalizarHojaDeRuta(datos.hojaDeRuta);
    if (!hoja.ok) throw new ErrorNegocio(hoja.error);
    const patente = normalizarPatente(datos.patente);
    if (!patente.ok) throw new ErrorNegocio(patente.error);

    await db.$transaction(async (tx) => {
      const antes = await leerEditable(tx, datos.descargaId, perfil);
      const nuevos = {
        tipo: datos.tipo,
        hojaDeRuta: hoja.valor,
        patente: patente.valor,
        productoId: datos.productoId,
        proveedorId: datos.proveedorId,
        tanqueId: datos.tanqueId,
        observaciones: datos.observaciones.trim() || null,
      };
      const previos = {
        tipo: antes.tipo,
        hojaDeRuta: antes.hojaDeRuta,
        patente: antes.patente,
        productoId: antes.productoId,
        proveedorId: antes.proveedorId,
        tanqueId: antes.tanqueId,
        observaciones: antes.observaciones,
      };
      const diferencias = cambiados(previos, nuevos);
      if (Object.keys(diferencias).length === 0) throw new ErrorNegocio("No hay cambios para guardar.");
      await exigirActivos(tx, diferencias);
      if (diferencias.hojaDeRuta && (await tx.descarga.findUnique({ where: { hojaDeRuta: hoja.valor } }))) {
        throw new ErrorNegocio(`Ya existe una descarga con la hoja de ruta ${hoja.valor}.`);
      }
      await tx.descarga.update({ where: { id: antes.id }, data: nuevos });
      await registrarAuditoria(tx, {
        perfil,
        entidad: "Descarga",
        entidadId: antes.id,
        accion: "EDITAR",
        antes: Object.fromEntries(Object.keys(diferencias).map((k) => [k, previos[k as keyof typeof previos]])),
        despues: diferencias,
      });
    });
  } catch (error) {
    return { error: mensajeDeError(error) };
  }
  refrescar(id);
  return { exito: "Cambios guardados." };
}

export async function editarTramo(_previo: EstadoEdicion, formulario: FormData): Promise<EstadoEdicion> {
  const { perfil } = await exigirPermiso("descargas.operar");
  let id = 0;
  try {
    const datos = leer(esquemaEditarTramo, formulario);
    id = datos.descargaId;
    const inicio = instante(datos.inicioDia, datos.inicioHora);

    await db.$transaction(async (tx) => {
      const descarga = await leerEditable(tx, datos.descargaId, perfil);
      const tramo = descarga.tramos.find((t) => t.id === datos.tramoId);
      if (!tramo) throw new ErrorNegocio("El tramo no es de esta descarga.");

      // Un tramo en curso sigue en curso y uno cerrado sigue cerrado: el estado no cambia al editar.
      let fin: Date | null = null;
      if (tramo.fin) {
        if (!datos.finDia || !datos.finHora) throw new ErrorNegocio("Elegí el día y la hora de fin.");
        fin = instante(datos.finDia, datos.finHora);
      }

      const tramos = descarga.tramos.map((t) => (t.id === tramo.id ? { id: t.id, inicio, fin } : t));
      const error = errorEnTramos(tramos, new Date());
      if (error) throw new ErrorNegocio(error);

      await exigirActivos(
        tx,
        cambiados({ bombaId: tramo.bombaId, operarioId: tramo.operarioId }, { bombaId: datos.bombaId, operarioId: datos.operarioId }),
      );
      // Un tramo en curso no puede pasar a una bomba en mantenimiento (los cerrados son historia).
      if (!fin && datos.bombaId !== tramo.bombaId) await exigirBombaSinMantenimiento(tx, datos.bombaId);
      await exigirBombaLibre(tx, datos.bombaId, inicio, fin, descarga.id);

      const previos = { bombaId: tramo.bombaId, operarioId: tramo.operarioId, inicio: tramo.inicio.toISOString(), fin: tramo.fin?.toISOString() ?? null };
      const nuevos = { bombaId: datos.bombaId, operarioId: datos.operarioId, inicio: inicio.toISOString(), fin: fin?.toISOString() ?? null };
      const diferencias = cambiados(previos, nuevos);
      if (Object.keys(diferencias).length === 0) throw new ErrorNegocio("No hay cambios para guardar.");

      await tx.tramoBombeo.update({
        where: { id: tramo.id },
        data: { bombaId: datos.bombaId, operarioId: datos.operarioId, inicio, fin },
      });
      await registrarAuditoria(tx, {
        perfil,
        entidad: "TramoBombeo",
        entidadId: tramo.id,
        accion: "EDITAR",
        antes: { descargaId: descarga.id, ...Object.fromEntries(Object.keys(diferencias).map((k) => [k, previos[k as keyof typeof previos]])) },
        despues: { descargaId: descarga.id, ...diferencias },
      });
    });
  } catch (error) {
    return { error: mensajeDeError(error) };
  }
  refrescar(id);
  return { exito: "Tramo guardado." };
}

const fotoTramo = (t: { bombaId: number; operarioId: number; inicio: Date; fin: Date | null; toneladas?: { toString(): string } | null }, descargaId: number) => ({
  descargaId,
  bombaId: t.bombaId,
  operarioId: t.operarioId,
  inicio: t.inicio.toISOString(),
  fin: t.fin?.toISOString() ?? null,
  toneladas: t.toneladas?.toString() ?? null,
});

/** Agrega un tramo cerrado que faltó cargar (por ejemplo, olvidaron reanudar en la app). */
export async function agregarTramo(_previo: EstadoEdicion, formulario: FormData): Promise<EstadoEdicion> {
  const { perfil } = await exigirPermiso("descargas.operar");
  let id = 0;
  try {
    const datos = leer(esquemaAgregarTramo, formulario);
    id = datos.descargaId;
    const inicio = instante(datos.inicioDia, datos.inicioHora);
    const fin = instante(datos.finDia, datos.finHora);

    await db.$transaction(async (tx) => {
      const descarga = await leerEditable(tx, datos.descargaId, perfil);
      const error = errorEnTramos([...descarga.tramos, { id: 0, inicio, fin }], new Date());
      if (error) throw new ErrorNegocio(error);
      await exigirActivos(tx, { bombaId: datos.bombaId, operarioId: datos.operarioId });
      await exigirBombaLibre(tx, datos.bombaId, inicio, fin, descarga.id);
      const nuevo = await tx.tramoBombeo.create({
        data: { descargaId: descarga.id, bombaId: datos.bombaId, operarioId: datos.operarioId, inicio, fin },
      });
      await registrarAuditoria(tx, {
        perfil,
        entidad: "TramoBombeo",
        entidadId: nuevo.id,
        accion: "CREAR",
        despues: fotoTramo(nuevo, descarga.id),
      });
    });
  } catch (error) {
    return { error: mensajeDeError(error) };
  }
  refrescar(id);
  return { exito: "Tramo agregado." };
}

/** Quita un tramo cargado por error. Queda en la auditoría con todos sus datos. */
export async function quitarTramo(_previo: EstadoEdicion, formulario: FormData): Promise<EstadoEdicion> {
  const { perfil } = await exigirPermiso("descargas.operar");
  const id = Number(formulario.get("descargaId"));
  const tramoId = Number(formulario.get("tramoId"));
  try {
    await db.$transaction(async (tx) => {
      const descarga = await leerEditable(tx, id, perfil);
      const efecto = efectoDeQuitar(descarga.estado, descarga.tramos, tramoId);
      if (!efecto.ok) throw new ErrorNegocio(efecto.error);
      const tramo = descarga.tramos.find((t) => t.id === tramoId)!;

      await tx.tramoBombeo.delete({ where: { id: tramoId } });
      await registrarAuditoria(tx, {
        perfil,
        entidad: "TramoBombeo",
        entidadId: tramoId,
        accion: "ELIMINAR",
        antes: fotoTramo(tramo, descarga.id),
      });

      if (efecto.nuevoEstado !== descarga.estado) {
        await tx.descarga.update({ where: { id }, data: { estado: efecto.nuevoEstado } });
        await registrarAuditoria(tx, {
          perfil,
          entidad: "Descarga",
          entidadId: id,
          accion: "EDITAR",
          antes: { estado: descarga.estado },
          despues: { estado: efecto.nuevoEstado },
        });
      }
      const conAsignacion = descarga.tramos.filter((t) => t.id !== tramoId && t.toneladas !== null);
      if (efecto.limpiarAsignaciones && conAsignacion.length > 0) {
        await tx.tramoBombeo.updateMany({ where: { descargaId: id }, data: { toneladas: null } });
        await registrarAuditoria(tx, {
          perfil,
          entidad: "Descarga",
          entidadId: id,
          accion: "EDITAR",
          antes: { tramos: conAsignacion.map((t) => ({ id: t.id, toneladas: t.toneladas!.toString() })) },
          despues: { tramos: conAsignacion.map((t) => ({ id: t.id, toneladas: null })) },
        });
      }
    });
  } catch (error) {
    return { error: mensajeDeError(error) };
  }
  refrescar(id);
  return { exito: "Tramo quitado." };
}

/**
 * Supervisor: corrige los kilos totales de una descarga finalizada y, si usó
 * más de una bomba, asigna kilos a cada tramo ("asignación manual").
 */
export async function editarToneladas(_previo: EstadoEdicion, formulario: FormData): Promise<EstadoEdicion> {
  const { perfil } = await exigirPermiso("tramos.asignarToneladas");
  const id = Number(formulario.get("descargaId"));
  try {
    const total = interpretarKilos(String(formulario.get("kilos") ?? ""));
    if (!total.ok) throw new ErrorNegocio(total.error);

    await db.$transaction(async (tx) => {
      const descarga = await leerEditable(tx, id, perfil);
      if (descarga.estado !== "FINALIZADA") throw new ErrorNegocio("Los kilos se cargan al finalizar la descarga.");

      const variasBombas = usaVariasBombas(descarga.tramos);
      const asignadas = descarga.tramos.map((t) => {
        const texto = String(formulario.get(`tramo-${t.id}`) ?? "").trim();
        if (!variasBombas || texto === "") return null;
        const valor = interpretarKilos(texto);
        if (!valor.ok) throw new ErrorNegocio(`Tramo: ${valor.error}`);
        return valor.valor;
      });
      const error = errorEnAsignacion(total.valor, asignadas);
      if (error) throw new ErrorNegocio(error);

      const antes = {
        toneladas: descarga.toneladas?.toString() ?? null,
        tramos: descarga.tramos.map((t) => ({ id: t.id, toneladas: t.toneladas?.toString() ?? null })),
      };
      await tx.descarga.update({ where: { id }, data: { toneladas: total.valor } });
      for (const [i, t] of descarga.tramos.entries()) {
        await tx.tramoBombeo.update({ where: { id: t.id }, data: { toneladas: asignadas[i] } });
      }
      await registrarAuditoria(tx, {
        perfil,
        entidad: "Descarga",
        entidadId: id,
        accion: "EDITAR",
        antes,
        despues: { toneladas: total.valor, tramos: descarga.tramos.map((t, i) => ({ id: t.id, toneladas: asignadas[i] })) },
      });
    });
  } catch (error) {
    return { error: mensajeDeError(error) };
  }
  refrescar(id);
  return { exito: "Kilos guardados." };
}
