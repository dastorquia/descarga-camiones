import { NextResponse, type NextRequest } from "next/server";
import { armarReportes } from "@/modules/descargas/reportes/datos";
import { aExcel } from "@/modules/descargas/reportes/excel";
import { leerFiltrosReporte } from "@/modules/descargas/reportes/filtros";
import { aCsv } from "@/modules/descargas/reportes/tabla";
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

  if (parametros.formato === "csv") {
    const tabla = tablas.find((t) => t.id === parametros.tabla);
    if (!tabla) return NextResponse.json({ error: "Reporte inexistente" }, { status: 404 });
    return new NextResponse(aCsv(tabla), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${tabla.id}_${sufijo}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const tipo = filtros.tipo === "CARGA" ? "Solo cargas" : filtros.tipo === "DESCARGA" ? "Solo descargas" : "Descargas y cargas";
  const archivo = await aExcel(tablas, `Período: ${filtros.desde} a ${filtros.hasta} · ${tipo}`);
  return new NextResponse(new Uint8Array(archivo), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="reportes_${sufijo}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
