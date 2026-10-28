"use server";

import { revalidatePath } from "next/cache";
import { registrarAuditoria } from "@/shared/auditoria/registrar";
import { exigirPermiso } from "@/shared/auth/sesion";
import { db } from "@/shared/lib/db";
import { actualizarItem, crearItem, ENTIDAD, existeOtro, leerItem } from "./admin";
import { CATALOGOS, esCatalogo, normalizarSector, normalizarValor, type Catalogo } from "./validacion";

export type EstadoCatalogo = { error?: string; exito?: string };

function leerCatalogo(formulario: FormData): Catalogo {
  const catalogo = formulario.get("catalogo");
  if (!esCatalogo(catalogo)) throw new Error("Catálogo inválido");
  return catalogo;
}

class Duplicado extends Error {}

function mensajeDeError(error: unknown, catalogo: Catalogo): string {
  if (error instanceof Duplicado || (error as { code?: string })?.code === "P2002") {
    return `Ya existe un ${CATALOGOS[catalogo].singular} con ese ${CATALOGOS[catalogo].etiqueta.toLowerCase()}.`;
  }
  console.error(error);
  return "No se pudo guardar. Probá de nuevo.";
}

/** Alta (sin id) o edición (con id) de un elemento de catálogo. */
export async function guardarItem(_previo: EstadoCatalogo, formulario: FormData): Promise<EstadoCatalogo> {
  const { perfil } = await exigirPermiso("catalogos.administrar");
  const catalogo = leerCatalogo(formulario);
  const id = Number(formulario.get("id") || 0);

  const valor = normalizarValor(catalogo, String(formulario.get("valor") ?? ""));
  if (!valor.ok) return { error: valor.error };
  const sector = catalogo === "bombas" ? normalizarSector(String(formulario.get("sector") ?? "")) : null;
  if (sector && !sector.ok) return { error: sector.error };
  const datos = { valor: valor.valor, sector: sector?.ok ? sector.valor : undefined };

  try {
    await db.$transaction(async (tx) => {
      if (await existeOtro(tx, catalogo, datos.valor, id)) throw new Duplicado();
      if (!id) {
        const nuevo = await crearItem(tx, catalogo, datos);
        await registrarAuditoria(tx, {
          perfil,
          entidad: ENTIDAD[catalogo],
          entidadId: nuevo,
          accion: "CREAR",
          despues: { valor: datos.valor, sector: datos.sector ?? null },
        });
        return;
      }
      const antes = await leerItem(tx, catalogo, id);
      if (!antes) throw new Error("No existe");
      await actualizarItem(tx, catalogo, id, datos);
      await registrarAuditoria(tx, {
        perfil,
        entidad: ENTIDAD[catalogo],
        entidadId: id,
        accion: "EDITAR",
        antes: { valor: antes.valor, sector: antes.sector },
        despues: { valor: datos.valor, sector: catalogo === "bombas" ? datos.sector || null : null },
      });
    });
  } catch (error) {
    return { error: mensajeDeError(error, catalogo) };
  }
  revalidatePath(`/supervisor/administracion/${catalogo}`);
  return { exito: id ? "Cambios guardados." : `Se agregó ${datos.valor}.` };
}

/** Desactiva o reactiva. Los catálogos nunca se borran (sección 4). */
export async function cambiarActivo(_previo: EstadoCatalogo, formulario: FormData): Promise<EstadoCatalogo> {
  const { perfil } = await exigirPermiso("catalogos.administrar");
  const catalogo = leerCatalogo(formulario);
  const id = Number(formulario.get("id"));
  const activo = formulario.get("activo") === "true";

  try {
    await db.$transaction(async (tx) => {
      const antes = await leerItem(tx, catalogo, id);
      if (!antes) throw new Error("No existe");
      await actualizarItem(tx, catalogo, id, { valor: antes.valor, activo });
      await registrarAuditoria(tx, {
        perfil,
        entidad: ENTIDAD[catalogo],
        entidadId: id,
        accion: activo ? "REACTIVAR" : "DESACTIVAR",
        antes: { activo: antes.activo },
        despues: { activo },
      });
    });
  } catch (error) {
    return { error: mensajeDeError(error, catalogo) };
  }
  revalidatePath(`/supervisor/administracion/${catalogo}`);
  return {};
}
