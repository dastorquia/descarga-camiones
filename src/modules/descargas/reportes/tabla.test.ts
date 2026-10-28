import { describe, expect, it } from "vitest";
import { aCsv, mostrar, type Tabla } from "./tabla";

describe("tabla de reporte", () => {
  it("muestra valores con coma decimal y unidad", () => {
    expect(mostrar(6.75, "horas")).toBe("6,75 h");
    expect(mostrar(28450, "kilos")).toBe("28.450 kg");
    expect(mostrar(4214.8, "rendimiento")).toBe("4.215 kg/h");
    expect(mostrar(1234, "entero")).toBe("1.234");
    expect(mostrar(null, "kilos")).toBe("—");
  });

  it("arma un CSV para Excel en Argentina: ';', coma decimal, BOM y comillas cuando hace falta", () => {
    const tabla: Tabla = {
      id: "x",
      titulo: "X",
      hoja: "X",
      columnas: [
        { titulo: "Bomba", tipo: "texto" },
        { titulo: "Horas", tipo: "horas" },
        { titulo: "Kilos", tipo: "kilos" },
      ],
      filas: [
        ["D1-BCI010", 6.75, 28450],
        ['Texto; con "comillas"', null, 0],
      ],
    };
    expect(aCsv(tabla)).toBe(
      "\uFEFFBomba;Horas (h);Kilos (kg)\r\nD1-BCI010;6,75;28450\r\n\"Texto; con \"\"comillas\"\"\";;0\r\n",
    );
  });
});
