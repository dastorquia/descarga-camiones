import { INACTIVIDAD_MAXIMA_MS, type DatosSesion } from "./token";

// Opciones de la cookie de sesión, compartidas por el proxy y el servidor.

export const COOKIE_SESION = "sesion";
export const COOKIE_DISPOSITIVO = "dispositivo";

/** Encabezado de los pedidos automáticos (tableros): no cuentan como actividad de la persona. */
export const ENCABEZADO_AUTOMATICO = "x-actualizacion-automatica";

export function secretoSesion(): string {
  const secreto = process.env["SESSION_SECRET"];
  if (!secreto) throw new Error("Falta SESSION_SECRET en el archivo .env");
  return secreto;
}

export function opcionesCookieSesion(datos: DatosSesion) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(INACTIVIDAD_MAXIMA_MS[datos.perfil] / 1000),
  };
}

export const opcionesCookieDispositivo = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 365 * 24 * 60 * 60,
};
