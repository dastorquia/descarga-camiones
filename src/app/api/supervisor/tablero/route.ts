import { NextResponse } from "next/server";
import { datosTablero } from "@/modules/descargas/tablero-supervisor/datos";
import { puede } from "@/shared/auth/perfiles";
import { obtenerSesion } from "@/shared/auth/sesion";

// Datos del tablero para la actualización automática (cada 20 segundos).
export async function GET() {
  const sesion = await obtenerSesion();
  if (!sesion || !puede(sesion.perfil, "tablero.supervisor")) {
    return NextResponse.json({ error: "Sesión vencida" }, { status: 401 });
  }
  return NextResponse.json(await datosTablero(), { headers: { "Cache-Control": "no-store" } });
}
