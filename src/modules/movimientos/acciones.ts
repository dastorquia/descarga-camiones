"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { normalizarPatente } from "@/modules/descargas/dominio/reglas";
import { interpretarKilos } from "@/modules/descargas/dominio/toneladas";
import { ErrorNegocio, exigirActivos, instante, leer, mensajeDeError } from "@/modules/descargas/servidor";
import { registrarAuditoria } from "@/shared/auditoria/registrar";
import { exigirPermiso } from "@/shared/auth/sesion";
import { db } from "@/shared/lib/db";
import { errorEnMovimiento } from "./reglas";

export type EstadoMovimiento = { error?: string };

const id = (mensaje: string) => z.coerce.number({ error: mensaje }).int().positive(mensaje);
const dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Elegí el día.");
const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Elegí la hora.");

const esquema = z.object({
  tanqueOrigenId: id("Elegí el tanque de origen."),
  tanqueDestinoId: id("Elegí el tanque de destino."),
  bombaCargaId: id("Elegí la bomba de carga."),
  bombaDescargaId: id("Elegí la bomba de descarga."),
  operarioId: id("Elegí el colaborador."),
  kilos: z.string(),
  patente: z.string(),
  inicioDia: dia,
  inicioHora: hora,
  finDia: dia,
  finHora: hora,
});

/** Registra un movimiento interno ya terminado (se carga todo junto). */
export async function registrarMovimiento(_previo: EstadoMovimiento, formulario: FormData): Promise<EstadoMovimiento> {
  const { perfil } = await exigirPermiso("descargas.operar");
  try {
    const d = leer(esquema, formulario);
    const kilos = interpretarKilos(d.kilos);
    if (!kilos.ok) throw new ErrorNegocio(kilos.error);
    const patente = normalizarPatente(d.patente);
    if (!patente.ok) throw new ErrorNegocio(patente.error);
    const inicio = instante(d.inicioDia, d.inicioHora);
    const fin = instante(d.finDia, d.finHora);
    const error = errorEnMovimiento({ ...d, inicio, fin }, new Date());
    if (error) throw new ErrorNegocio(error);

    await db.$transaction(async (tx) => {
      await exigirActivos(tx, { tanqueId: d.tanqueOrigenId, bombaId: d.bombaCargaId, operarioId: d.operarioId });
      await exigirActivos(tx, { tanqueId: d.tanqueDestinoId, bombaId: d.bombaDescargaId });
      const m = await tx.movimientoInterno.create({
        data: {
          tanqueOrigenId: d.tanqueOrigenId,
          tanqueDestinoId: d.tanqueDestinoId,
          bombaCargaId: d.bombaCargaId,
          bombaDescargaId: d.bombaDescargaId,
          operarioId: d.operarioId,
          toneladas: kilos.valor,
          patente: patente.valor,
          inicio,
          fin,
        },
      });
      await registrarAuditoria(tx, {
        perfil,
        entidad: "MovimientoInterno",
        entidadId: m.id,
        accion: "CREAR",
        despues: { tanqueId: d.tanqueOrigenId, toneladas: kilos.valor, patente: patente.valor, inicio: inicio.toISOString(), fin: fin.toISOString() },
      });
    });
  } catch (error) {
    return { error: mensajeDeError(error) };
  }
  revalidatePath("/colaborador");
  revalidatePath("/supervisor");
  redirect("/colaborador?registrado=movimiento");
}
