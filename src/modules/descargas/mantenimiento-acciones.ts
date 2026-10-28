"use server";

import { revalidatePath } from "next/cache";
import { registrarAuditoria } from "@/shared/auditoria/registrar";
import { exigirPermiso } from "@/shared/auth/sesion";
import { db } from "@/shared/lib/db";
import { ErrorNegocio, mensajeDeError } from "./servidor";

// Bombas en mantenimiento (pedido del 29/10/2026): mientras están en mantenimiento
// no se pueden elegir para iniciar ni reanudar. Queda en la auditoría.

export type EstadoMantenimiento = { error?: string };

function refrescar() {
  revalidatePath("/colaborador");
  revalidatePath("/colaborador/nueva");
  revalidatePath("/supervisor");
}

export async function ponerEnMantenimiento(_previo: EstadoMantenimiento, formulario: FormData): Promise<EstadoMantenimiento> {
  const { perfil } = await exigirPermiso("bombas.mantenimiento");
  const bombaId = Number(formulario.get("bombaId"));
  const motivo = String(formulario.get("motivo") ?? "").trim().slice(0, 200) || null;
  try {
    await db.$transaction(async (tx) => {
      const bomba = await tx.bomba.findUnique({ where: { id: bombaId } });
      if (!bomba || !bomba.activa) throw new ErrorNegocio("La bomba no existe o está desactivada.");
      const enUso = await tx.tramoBombeo.findFirst({
        where: { bombaId, fin: null },
        include: { descarga: { select: { hojaDeRuta: true } } },
      });
      if (enUso) {
        throw new ErrorNegocio(
          `La bomba ${bomba.codigo} está en uso (hoja de ruta ${enUso.descarga.hojaDeRuta}). Pausá o finalizá esa descarga antes.`,
        );
      }
      await tx.mantenimientoBomba.create({ data: { bombaId, motivo } });
      await registrarAuditoria(tx, {
        perfil,
        entidad: "Bomba",
        entidadId: bombaId,
        accion: "EDITAR",
        antes: { enMantenimiento: false },
        despues: { enMantenimiento: true, motivo },
      });
    });
  } catch (error) {
    return { error: mensajeDeError(error) };
  }
  refrescar();
  return {};
}

export async function terminarMantenimiento(_previo: EstadoMantenimiento, formulario: FormData): Promise<EstadoMantenimiento> {
  const { perfil } = await exigirPermiso("bombas.mantenimiento");
  const bombaId = Number(formulario.get("bombaId"));
  try {
    await db.$transaction(async (tx) => {
      const abierto = await tx.mantenimientoBomba.findFirst({ where: { bombaId, hasta: null } });
      if (!abierto) throw new ErrorNegocio("La bomba no está en mantenimiento.");
      await tx.mantenimientoBomba.update({ where: { id: abierto.id }, data: { hasta: new Date() } });
      await registrarAuditoria(tx, {
        perfil,
        entidad: "Bomba",
        entidadId: bombaId,
        accion: "EDITAR",
        antes: { enMantenimiento: true, motivo: abierto.motivo },
        despues: { enMantenimiento: false },
      });
    });
  } catch (error) {
    return { error: mensajeDeError(error) };
  }
  refrescar();
  return {};
}
