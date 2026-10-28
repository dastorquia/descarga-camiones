import "server-only";
import ExcelJS from "exceljs";
import { tituloConUnidad, type Tabla, type TipoColumna } from "./tabla";

const FORMATO: Partial<Record<TipoColumna, string>> = {
  horas: "0.00",
  toneladas: "0.000",
  rendimiento: "0.00",
  entero: "0",
};

/** Un libro de Excel con una hoja por reporte. Los números quedan como números (no texto). */
export async function aExcel(tablas: Tabla[], encabezado: string): Promise<Buffer> {
  const libro = new ExcelJS.Workbook();
  libro.creator = "Carga y descarga de camiones";
  const usados = new Set<string>();
  for (const t of tablas) {
    // Excel limita los nombres de hoja a 31 caracteres y no admite repetidos.
    let nombre = t.hoja.replace(/[\\/?*[\]:]/g, "").slice(0, 31);
    while (usados.has(nombre)) nombre = `${nombre.slice(0, 28)} ${usados.size}`;
    usados.add(nombre);

    const hoja = libro.addWorksheet(nombre);
    hoja.addRow([t.titulo]).font = { bold: true, size: 13 };
    hoja.addRow([encabezado]);
    if (t.descripcion) hoja.addRow([t.descripcion]).font = { italic: true };
    hoja.addRow([]);
    const titulos = hoja.addRow(t.columnas.map(tituloConUnidad));
    titulos.font = { bold: true };
    for (const fila of t.filas) hoja.addRow(fila.map((v) => v ?? ""));

    t.columnas.forEach((c, i) => {
      const columna = hoja.getColumn(i + 1);
      columna.width = Math.max(12, Math.min(40, tituloConUnidad(c).length + 4));
      const formato = FORMATO[c.tipo];
      if (formato) columna.numFmt = formato;
    });
  }
  return Buffer.from(await libro.xlsx.writeBuffer());
}
