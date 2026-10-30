import type { NextRequest } from "next/server";
import { historialParaExportar } from "@/modules/descargas/datos";
import { leerFiltros } from "@/modules/descargas/dominio/filtros";
import { tablaHistorial } from "@/modules/descargas/reportes/historial";
import { respuestaExportacion } from "@/modules/descargas/reportes/respuesta";
import { exigirPermiso } from "@/shared/auth/sesion";
import { aDiaHora, formatearFechaHora } from "@/shared/lib/fechas";

// Exportación del historial con los mismos filtros de la pantalla (todas las páginas).
// ?formato=xlsx o ?formato=csv.
export async function GET(pedido: NextRequest) {
  await exigirPermiso("descargas.operar");
  const p = Object.fromEntries(pedido.nextUrl.searchParams);
  const ahora = new Date();
  const tabla = tablaHistorial(await historialParaExportar(leerFiltros(p)));
  return respuestaExportacion([tabla], {
    formato: p.formato ?? null,
    nombre: `historial_${aDiaHora(ahora).dia}`,
    encabezado: `Generado el ${formatearFechaHora(ahora)}`,
  });
}
