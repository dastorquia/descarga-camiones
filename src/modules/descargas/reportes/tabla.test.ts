import { describe, expect, it } from "vitest";
import { aCsv, mostrar, type Tabla } from "./tabla";

describe("tabla de reporte", () => {
  it("muestra valores con coma decimal y unidad", () => {
    expect(mostrar(6.75, "horas")).toBe("6,75 h");
    expect(mostrar(28.45, "toneladas")).toBe("28,450 t");
    expect(mostrar(4.2148, "rendimiento")).toBe("4,21 t/h");
    expect(mostrar(1234, "entero")).toBe("1.234");
    expect(mostrar(null, "toneladas")).toBe("—");
  });

  it("arma un CSV para Excel en Argentina: ';', coma decimal, BOM y comillas cuando hace falta", () => {
    const tabla: Tabla = {
      id: "x",
      titulo: "X",
      hoja: "X",
      columnas: [
        { titulo: "Bomba", tipo: "texto" },
        { titulo: "Horas", tipo: "horas" },
        { titulo: "Toneladas", tipo: "toneladas" },
      ],
      filas: [
        ["D1-BCI010", 6.75, 1234.5],
        ['Texto; con "comillas"', null, 0],
      ],
    };
    expect(aCsv(tabla)).toBe(
      '﻿Bomba;Horas (h);Toneladas (t)\r\nD1-BCI010;6,75;1234,500\r\n"Texto; con ""comillas""";;0,000\r\n',
    );
  });
});
