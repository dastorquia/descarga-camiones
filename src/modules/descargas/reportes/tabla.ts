// Tabla genérica de un reporte: la misma sirve para la pantalla, el CSV y el Excel.

export type TipoColumna = "texto" | "horas" | "kilos" | "rendimiento" | "entero";

export type Columna = { titulo: string; tipo: TipoColumna };

export type Valor = string | number | null;

export type Tabla = {
  id: string;
  titulo: string;
  /** Nombre corto para la hoja de Excel (máximo 31 caracteres). */
  hoja: string;
  descripcion?: string;
  columnas: Columna[];
  filas: Valor[][];
};

const UNIDAD: Partial<Record<TipoColumna, string>> = { horas: "h", kilos: "kg", rendimiento: "kg/h" };
const DECIMALES: Record<TipoColumna, number> = { texto: 0, horas: 2, kilos: 0, rendimiento: 0, entero: 0 };

/** Valor para mostrar en pantalla: "6,75 h", "28,450 t", "—". */
export function mostrar(valor: Valor, tipo: TipoColumna): string {
  if (valor === null || valor === "") return "—";
  if (typeof valor === "string") return valor;
  const n = valor.toLocaleString("es-AR", { minimumFractionDigits: DECIMALES[tipo], maximumFractionDigits: DECIMALES[tipo] });
  return UNIDAD[tipo] ? `${n} ${UNIDAD[tipo]}` : n;
}

/** Título de columna con la unidad, para CSV y Excel: "Horas (h)". */
export function tituloConUnidad(c: Columna): string {
  return UNIDAD[c.tipo] ? `${c.titulo} (${UNIDAD[c.tipo]})` : c.titulo;
}

/**
 * CSV pensado para abrir con Excel en Argentina: separador ";", coma decimal,
 * sin unidades en las celdas y con BOM para que respete los acentos.
 */
export function aCsv(tabla: Tabla): string {
  const celda = (v: Valor, tipo: TipoColumna): string => {
    if (v === null) return "";
    if (typeof v === "number") {
      return v.toLocaleString("es-AR", { useGrouping: false, minimumFractionDigits: DECIMALES[tipo], maximumFractionDigits: DECIMALES[tipo] });
    }
    return /[";\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  };
  const lineas = [
    tabla.columnas.map((c) => celda(tituloConUnidad(c), "texto")).join(";"),
    ...tabla.filas.map((f) => f.map((v, i) => celda(v, tabla.columnas[i]!.tipo)).join(";")),
  ];
  return `﻿${lineas.join("\r\n")}\r\n`;
}
