"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { esFuturo } from "@/modules/descargas/dominio/reglas";
import { ErrorNegocio, exigirActivos, instante, mensajeDeError } from "@/modules/descargas/servidor";
import { registrarAuditoria } from "@/shared/auditoria/registrar";
import { exigirPermiso } from "@/shared/auth/sesion";
import { db } from "@/shared/lib/db";
import { esTarea } from "./tareas";

export type EstadoAutonomo = { error?: string };

/** Colaborador o Supervisor: registra las tareas de mantenimiento autónomo hechas (una fila por tarea). */
export async function registrarTarea(_previo: EstadoAutonomo, formulario: FormData): Promise<EstadoAutonomo> {
  const { perfil } = await exigirPermiso("descargas.operar");
  try {
    const bombaId = Number(formulario.get("bombaId"));
    const operarioId = Number(formulario.get("operarioId"));
    const tareas = formulario.getAll("tarea");
    const observaciones = String(formulario.get("observaciones") ?? "").trim() || null;
    if (!bombaId) throw new ErrorNegocio("Elegí la bomba.");
    if (tareas.length === 0) throw new ErrorNegocio("Marcá al menos una tarea.");
    if (!tareas.every(esTarea) || new Set(tareas).size !== tareas.length) throw new ErrorNegocio("Revisá las tareas marcadas.");
    if (!operarioId) throw new ErrorNegocio("Elegí el colaborador.");
    if (observaciones && observaciones.length > 200) throw new ErrorNegocio("Las observaciones pueden tener hasta 200 caracteres.");
    const fecha = instante(String(formulario.get("dia") ?? ""), String(formulario.get("hora") ?? ""));
    if (esFuturo(fecha, new Date())) throw new ErrorNegocio("La hora no puede ser futura.");

    await db.$transaction(async (tx) => {
      await exigirActivos(tx, { bombaId, operarioId });
      if (!(await tx.bombaAutonomo.findUnique({ where: { bombaId } }))) {
        throw new ErrorNegocio("Esa bomba no tiene mantenimiento autónomo.");
      }
      for (const tarea of tareas) {
        const t = await tx.tareaAutonoma.create({ data: { bombaId, tarea, operarioId, fecha, observaciones } });
        await registrarAuditoria(tx, {
          perfil,
          entidad: "TareaAutonoma",
          entidadId: t.id,
          accion: "CREAR",
          despues: { bombaId, tarea, operarioId, fecha: fecha.toISOString(), observaciones },
        });
      }
    });
  } catch (error) {
    return { error: mensajeDeError(error) };
  }
  revalidatePath("/supervisor/autonomo");
  redirect("/colaborador?registrado=autonomo");
}

/** Supervisor: marca o desmarca que una bomba requiere mantenimiento autónomo. */
export async function cambiarAutonomo(_previo: EstadoAutonomo, formulario: FormData): Promise<EstadoAutonomo> {
  const { perfil } = await exigirPermiso("catalogos.administrar");
  const bombaId = Number(formulario.get("bombaId"));
  const requiere = formulario.get("requiere") === "true";
  try {
    await db.$transaction(async (tx) => {
      if (requiere) await tx.bombaAutonomo.upsert({ where: { bombaId }, update: {}, create: { bombaId } });
      else await tx.bombaAutonomo.deleteMany({ where: { bombaId } });
      await registrarAuditoria(tx, {
        perfil,
        entidad: "Bomba",
        entidadId: bombaId,
        accion: "EDITAR",
        antes: { mantenimientoAutonomo: !requiere },
        despues: { mantenimientoAutonomo: requiere },
      });
    });
  } catch (error) {
    return { error: mensajeDeError(error) };
  }
  revalidatePath("/supervisor/administracion/bombas");
  return {};
}
