import "server-only";
import { NextResponse } from "next/server";
import { aExcel } from "./excel";
import { aCsv, type Tabla } from "./tabla";

/**
 * Descarga de tablas: formato "csv" → solo la tabla `tablaId` (o la primera);
 * cualquier otro → un Excel con una hoja por tabla.
 */
export async function respuestaExportacion(
  tablas: Tabla[],
  { formato, tablaId, nombre, encabezado }: { formato: string | null; tablaId?: string | null; nombre: string; encabezado: string },
) {
  if (formato === "csv") {
    const tabla = tablaId ? tablas.find((t) => t.id === tablaId) : tablas[0];
    if (!tabla) return NextResponse.json({ error: "Tabla inexistente" }, { status: 404 });
    return new NextResponse(aCsv(tabla), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${tablas.length > 1 ? `${nombre}_${tabla.id}` : nombre}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }
  const archivo = await aExcel(tablas, encabezado);
  return new NextResponse(new Uint8Array(archivo), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nombre}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
