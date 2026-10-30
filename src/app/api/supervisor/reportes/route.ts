import { NextResponse, type NextRequest } from "next/server";
import { armarReportes } from "@/modules/descargas/reportes/datos";
import { leerFiltrosReporte } from "@/modules/descargas/reportes/filtros";
import { respuestaExportacion } from "@/modules/descargas/reportes/respuesta";
import { puede } from "@/shared/auth/perfiles";
import { obtenerSesion } from "@/shared/auth/sesion";

// Exportación de reportes con los mismos filtros de la pantalla.
// ?formato=xlsx → todos los reportes en un libro; ?formato=csv&tabla=<id> → uno solo.
export async function GET(pedido: NextRequest) {
  const sesion = await obtenerSesion();
  if (!sesion || !puede(sesion.perfil, "reportes.ver")) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 401 });
  }
  const parametros = Object.fromEntries(pedido.nextUrl.searchParams);
  const filtros = leerFiltrosReporte(parametros, new Date());
  const tablas = await armarReportes(filtros);
  const sufijo = `${filtros.desde}_a_${filtros.hasta}${filtros.tipo ? `_${filtros.tipo.toLowerCase()}` : ""}`;
  const tipo = filtros.tipo === "CARGA" ? "Solo cargas" : filtros.tipo === "DESCARGA" ? "Solo descargas" : "Descargas y cargas";

  if (parametros.formato === "csv") {
    if (!tablas.some((t) => t.id === parametros.tabla)) return NextResponse.json({ error: "Reporte inexistente" }, { status: 404 });
    return respuestaExportacion(tablas, { formato: "csv", tablaId: parametros.tabla, nombre: sufijo, encabezado: "" });
  }
  return respuestaExportacion(tablas, { formato: "xlsx", nombre: `reportes_${sufijo}`, encabezado: `Período: ${filtros.desde} a ${filtros.hasta} · ${tipo}` });
}
