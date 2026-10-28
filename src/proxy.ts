import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, opcionesCookieSesion, secretoSesion } from "@/shared/auth/cookie";
import { inicioDe, perfilesDeRuta } from "@/shared/auth/perfiles";
import { firmarSesion, leerSesion, sesionVigente } from "@/shared/auth/token";

// Control previo de rutas y renovación de la sesión por actividad.
// Es un filtro rápido: cada página y cada acción vuelve a verificar el permiso.

const RENOVAR_CADA_MS = 60_000;

export async function proxy(request: NextRequest) {
  const ahora = Date.now();
  const ruta = request.nextUrl.pathname;
  const perfilesPermitidos = perfilesDeRuta(ruta);
  const datos = await leerSesion(request.cookies.get(COOKIE_SESION)?.value, secretoSesion());
  const vigente = datos !== null && sesionVigente(datos, ahora);

  if (perfilesPermitidos) {
    if (!vigente) {
      const destino = new URL("/", request.url);
      if (datos?.perfil === "SUPERVISOR") destino.searchParams.set("motivo", "vencida");
      const respuesta = NextResponse.redirect(destino);
      respuesta.cookies.delete(COOKIE_SESION);
      return respuesta;
    }
    if (!perfilesPermitidos.includes(datos.perfil)) {
      return NextResponse.redirect(new URL(inicioDe(datos.perfil), request.url));
    }
  }

  const respuesta = NextResponse.next();
  if (vigente && ahora - datos.actividad > RENOVAR_CADA_MS) {
    const renovada = { perfil: datos.perfil, actividad: ahora };
    respuesta.cookies.set(COOKIE_SESION, await firmarSesion(renovada, secretoSesion()), opcionesCookieSesion(renovada));
  }
  return respuesta;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico|webmanifest)$).*)"],
};
