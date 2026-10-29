import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESION, opcionesCookieSesion, secretoSesion } from "./cookie";
import { inicioDe, puede, type Perfil, type Permiso } from "./perfiles";
import { firmarSesion, leerSesion, sesionVigente, type DatosSesion } from "./token";

// Sesión del lado del servidor. El perfil sale siempre de la cookie firmada,
// nunca de lo que diga el navegador.

export async function obtenerSesion(): Promise<DatosSesion | null> {
  const token = (await cookies()).get(COOKIE_SESION)?.value;
  const datos = await leerSesion(token, secretoSesion());
  return datos && sesionVigente(datos, Date.now()) ? datos : null;
}

/** Solo en Server Actions (ahí se pueden escribir cookies). */
export async function iniciarSesion(perfil: Perfil): Promise<void> {
  const datos: DatosSesion = { perfil, actividad: Date.now() };
  (await cookies()).set(COOKIE_SESION, await firmarSesion(datos, secretoSesion()), opcionesCookieSesion(datos));
}

/** Solo en Server Actions. */
export async function cerrarSesion(): Promise<void> {
  (await cookies()).delete(COOKIE_SESION);
}

/** Para páginas y acciones: sin sesión vuelve a la verificación; sin permiso, a su inicio. */
export async function exigirPermiso(permiso: Permiso): Promise<DatosSesion> {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/");
  if (!puede(sesion.perfil, permiso)) redirect(inicioDe(sesion.perfil));
  return sesion;
}

