import "server-only";
import bcrypt from "bcryptjs";
import { registrarAuditoria } from "@/shared/auditoria/registrar";
import { CLAVES_CONFIG, PIN_INICIAL } from "@/shared/config/claves";
import { db } from "@/shared/lib/db";
import {
  bloqueadoHasta,
  LIMITE_FALLIDOS,
  minutosRestantes,
  registrarFallo,
  SIN_INTENTOS,
  type EstadoIntentos,
} from "./bloqueo";

export type Origen = { dispositivo: string; ip: string };

export type ResultadoPin =
  | { ok: true }
  | { ok: false; motivo: "incorrecto"; intentosRestantes: number }
  | { ok: false; motivo: "bloqueado"; minutos: number };

async function leerIntentos(clave: string): Promise<EstadoIntentos> {
  const fila = await db.intentoPin.findUnique({ where: { clave } });
  return fila ?? SIN_INTENTOS;
}

async function guardarIntentos(clave: string, estado: EstadoIntentos) {
  await db.intentoPin.upsert({ where: { clave }, update: estado, create: { clave, ...estado } });
}

/**
 * Compara el PIN con el guardado, respetando el bloqueo por intentos.
 * Lo usan la entrada del Supervisor y el cambio de PIN.
 */
export async function comprobarPin(pin: string, origen: Origen): Promise<ResultadoPin> {
  const ahora = new Date();
  const claveDisp = `dispositivo:${origen.dispositivo}`;
  const claveIp = `ip:${origen.ip}`;
  const [disp, ip] = await Promise.all([leerIntentos(claveDisp), leerIntentos(claveIp)]);

  const hasta = [bloqueadoHasta(disp, ahora), bloqueadoHasta(ip, ahora)]
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  if (hasta) return { ok: false, motivo: "bloqueado", minutos: minutosRestantes(hasta, ahora) };

  const config = await db.config.findUnique({ where: { clave: CLAVES_CONFIG.pinSupervisorHash } });
  if (!config) throw new Error("No hay PIN de Supervisor configurado. Corré el seed.");

  if (await bcrypt.compare(pin, config.valor)) {
    await Promise.all([guardarIntentos(claveDisp, SIN_INTENTOS), guardarIntentos(claveIp, SIN_INTENTOS)]);
    return { ok: true };
  }

  const nuevoDisp = registrarFallo(disp, LIMITE_FALLIDOS.dispositivo, ahora);
  const nuevaIp = registrarFallo(ip, LIMITE_FALLIDOS.ip, ahora);
  await Promise.all([guardarIntentos(claveDisp, nuevoDisp), guardarIntentos(claveIp, nuevaIp)]);

  const nuevoHasta = nuevoDisp.bloqueadoHasta ?? nuevaIp.bloqueadoHasta;
  if (nuevoHasta) return { ok: false, motivo: "bloqueado", minutos: minutosRestantes(nuevoHasta, ahora) };
  return {
    ok: false,
    motivo: "incorrecto",
    intentosRestantes: LIMITE_FALLIDOS.dispositivo - nuevoDisp.fallidos,
  };
}

export async function usaPinPorDefecto(): Promise<boolean> {
  const fila = await db.config.findUnique({ where: { clave: CLAVES_CONFIG.pinPorDefecto } });
  return fila?.valor === "true";
}

/** Guarda el PIN nuevo (ya validado) y lo deja en la auditoría, sin el hash. */
export async function guardarPinNuevo(nuevo: string): Promise<void> {
  const hash = await bcrypt.hash(nuevo, 12);
  const porDefecto = nuevo === PIN_INICIAL;
  await db.$transaction(async (tx) => {
    const anterior = await tx.config.findUnique({ where: { clave: CLAVES_CONFIG.pinPorDefecto } });
    await tx.config.update({ where: { clave: CLAVES_CONFIG.pinSupervisorHash }, data: { valor: hash } });
    await tx.config.upsert({
      where: { clave: CLAVES_CONFIG.pinPorDefecto },
      update: { valor: String(porDefecto) },
      create: { clave: CLAVES_CONFIG.pinPorDefecto, valor: String(porDefecto) },
    });
    await registrarAuditoria(tx, {
      perfil: "SUPERVISOR",
      entidad: "Config.pinSupervisor",
      entidadId: 0,
      accion: "EDITAR",
      antes: { pinCambiado: false, pinPorDefecto: anterior?.valor === "true" },
      despues: { pinCambiado: true, pinPorDefecto: porDefecto },
    });
  });
}
