import type { NextRequest } from "next/server";
import { tablasAutonomo } from "@/modules/autonomo/exportar";
import { respuestaExportacion } from "@/modules/descargas/reportes/respuesta";
import { exigirPermiso } from "@/shared/auth/sesion";
import { aDiaHora, formatearFechaHora } from "@/shared/lib/fechas";

// Exportación del mantenimiento autónomo: ?formato=xlsx (las dos tablas) o ?formato=csv&tabla=<id>.
export async function GET(pedido: NextRequest) {
  await exigirPermiso("reportes.ver");
  const p = pedido.nextUrl.searchParams;
  const pedida = Number(p.get("bombaId"));
  const bombaId = Number.isInteger(pedida) && pedida > 0 ? pedida : null;
  const ahora = new Date();
  return respuestaExportacion(await tablasAutonomo(bombaId), {
    formato: p.get("formato"),
    tablaId: p.get("tabla"),
    nombre: `mant_autonomo_${aDiaHora(ahora).dia}`,
    encabezado: `Generado el ${formatearFechaHora(ahora)}`,
  });
}
