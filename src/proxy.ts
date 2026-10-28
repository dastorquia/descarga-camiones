import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, ENCABEZADO_AUTOMATICO, opcionesCookieSesion, secretoSesion } from "@/shared/auth/cookie";
import { inicioDe, perfilesDeRuta } from "@/shared/auth/perfiles";
import { firmarSesion, leerSesion, sesionVigente } from "@/shared/auth/token";

// Control previo de rutas y renovación de la sesión por actividad.
// Es un filtro rápido: cada página y cada acción vuelve a verificar el permiso.

const RENOVAR_CADA_MS = 60_000;

export async function proxy(request: NextRequest) {
  const ahora = Date.now();
  const ruta = request.nextUrl.pathname;
  const esApi = ruta.startsWith("/api/");
  const perfilesPermitidos = perfilesDeRuta(ruta);
  const datos = await leerSesion(request.cookies.get(COOKIE_SESION)?.value, secretoSesion());
  const vigente = datos !== null && sesionVigente(datos, ahora);

  if (perfilesPermitidos) {
    if (!vigente) {
      if (esApi) return NextResponse.json({ error: "Sesión vencida" }, { status: 401 });
      const destino = new URL("/", request.url);
      if (datos?.perfil === "SUPERVISOR") destino.searchParams.set("motivo", "vencida");
      const respuesta = NextResponse.redirect(destino);
      respuesta.cookies.delete(COOKIE_SESION);
      return respuesta;
    }
    if (!perfilesPermitidos.includes(datos.perfil)) {
      if (esApi) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
      return NextResponse.redirect(new URL(inicioDe(datos.perfil), request.url));
    }
  }

  const respuesta = NextResponse.next();
  // Las actualizaciones automáticas de los tableros no son actividad de la persona:
  // así la sesión del Supervisor igual vence tras 30 minutos sin uso.
  const automatico = request.headers.get(ENCABEZADO_AUTOMATICO) === "1";
  if (vigente && !automatico && ahora - datos.actividad > RENOVAR_CADA_MS) {
    const renovada = { perfil: datos.perfil, actividad: ahora };
    respuesta.cookies.set(COOKIE_SESION, await firmarSesion(renovada, secretoSesion()), opcionesCookieSesion(renovada));
  }
  return respuesta;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico|webmanifest)$).*)"],
};
