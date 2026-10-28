"use server";

import { revalidatePath } from "next/cache";
import { registrarAuditoria } from "@/shared/auditoria/registrar";
import { exigirPermiso } from "@/shared/auth/sesion";
import { db } from "@/shared/lib/db";
import { CLAVES_CONFIG } from "./claves";
import { leerUmbrales } from "./leer";
import { validarUmbrales } from "./umbrales";

export type EstadoUmbrales = { error?: string; exito?: string };

export async function guardarUmbrales(_previo: EstadoUmbrales, formulario: FormData): Promise<EstadoUmbrales> {
  const { perfil } = await exigirPermiso("configuracion.administrar");
  const resultado = validarUmbrales({
    kilosMin: String(formulario.get("kilosMin") ?? ""),
    kilosMax: String(formulario.get("kilosMax") ?? ""),
    horasAlertaTramoAbierto: String(formulario.get("horasAlertaTramoAbierto") ?? ""),
  });
  if (!resultado.ok) return { error: resultado.error };

  const antes = await leerUmbrales();
  await db.$transaction(async (tx) => {
    for (const [nombre, valor] of Object.entries(resultado.valores) as [keyof typeof resultado.valores, string][]) {
      const clave = CLAVES_CONFIG[nombre];
      await tx.config.upsert({ where: { clave }, update: { valor }, create: { clave, valor } });
    }
    await registrarAuditoria(tx, {
      perfil,
      entidad: "Config.umbrales",
      entidadId: 0,
      accion: "EDITAR",
      antes,
      despues: {
        kilosMin: Math.round(Number(resultado.valores.toneladasMin) * 1000),
        kilosMax: Math.round(Number(resultado.valores.toneladasMax) * 1000),
        horasAlertaTramoAbierto: Number(resultado.valores.horasAlertaTramoAbierto),
      },
    });
  });
  revalidatePath("/supervisor", "layout");
  return { exito: "Umbrales guardados." };
}
