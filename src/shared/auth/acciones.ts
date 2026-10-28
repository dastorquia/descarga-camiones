"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_DISPOSITIVO, opcionesCookieDispositivo } from "./cookie";
import { esquemaCambioPin, esquemaPin } from "./esquemas";
import { comprobarPin, guardarPinNuevo, type Origen, type ResultadoPin } from "./pin";
import { cerrarSesion, exigirPermiso, iniciarSesion } from "./sesion";

export type EstadoFormulario = { error?: string; exito?: string };

async function origenDelPedido(): Promise<Origen> {
  const almacen = await cookies();
  let dispositivo = almacen.get(COOKIE_DISPOSITIVO)?.value;
  if (!dispositivo) {
    dispositivo = crypto.randomUUID();
    almacen.set(COOKIE_DISPOSITIVO, dispositivo, opcionesCookieDispositivo);
  }
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconocida";
  return { dispositivo, ip };
}

function mensajeError(resultado: Exclude<ResultadoPin, { ok: true }>, quePin: string): string {
  if (resultado.motivo === "bloqueado") {
    const minutos = resultado.minutos === 1 ? "1 minuto" : `${resultado.minutos} minutos`;
    return `Demasiados intentos fallidos. Probá de nuevo en ${minutos}.`;
  }
  const quedan = resultado.intentosRestantes;
  return `${quePin} incorrecto. ${quedan === 1 ? "Te queda 1 intento" : `Te quedan ${quedan} intentos`}.`;
}

export async function entrarComoColaborador(): Promise<void> {
  await iniciarSesion("COLABORADOR");
  redirect("/colaborador");
}

export async function entrarComoSupervisor(
  _previo: EstadoFormulario,
  formulario: FormData,
): Promise<EstadoFormulario> {
  const pin = String(formulario.get("pin") ?? "");
  if (!esquemaPin.safeParse(pin).success) {
    return { error: "El PIN tiene entre 4 y 8 números." };
  }
  const resultado = await comprobarPin(pin, await origenDelPedido());
  if (!resultado.ok) return { error: mensajeError(resultado, "PIN") };

  await iniciarSesion("SUPERVISOR");
  redirect("/supervisor");
}

export async function salir(): Promise<void> {
  await cerrarSesion();
  redirect("/");
}

export async function cambiarPin(
  _previo: EstadoFormulario,
  formulario: FormData,
): Promise<EstadoFormulario> {
  await exigirPermiso("pin.cambiar");

  const datos = esquemaCambioPin.safeParse({
    actual: formulario.get("actual"),
    nuevo: formulario.get("nuevo"),
    repetido: formulario.get("repetido"),
  });
  if (!datos.success) return { error: datos.error.issues[0]?.message ?? "Revisá los datos." };

  const resultado = await comprobarPin(datos.data.actual, await origenDelPedido());
  if (!resultado.ok) return { error: mensajeError(resultado, "El PIN actual es") };

  await guardarPinNuevo(datos.data.nuevo);
  // Actualiza el aviso de "PIN por defecto" del menú.
  revalidatePath("/supervisor", "layout");
  return { exito: "Listo. El PIN se cambió." };
}
