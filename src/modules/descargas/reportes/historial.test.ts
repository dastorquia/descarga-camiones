import { describe, expect, it } from "vitest";
import { tablaHistorial } from "./historial";

const base = {
  hojaDeRuta: "78322",
  tipo: "DESCARGA" as const,
  patente: "AB123CD/AC456EF",
  producto: { nombre: "Borra" },
  proveedor: { nombre: "Proveedor 1" },
  tanque: { codigo: "TK-001" },
  observaciones: null,
};
const bomba = { codigo: "BCI010", descripcion: "Descarga 1" };
const h = (s: string) => new Date(`2026-10-01T${s}:00-03:00`);

describe("historial para exportar", () => {
  it("usa solo tramos cerrados para las horas y kilos enteros", () => {
    const [fila] = tablaHistorial([
      {
        ...base,
        estado: "FINALIZADA",
        toneladas: "28.450",
        tramos: [
          { inicio: h("16:00"), fin: h("19:30"), bomba },
          { inicio: new Date("2026-10-02T06:00:00-03:00"), fin: new Date("2026-10-02T09:15:00-03:00"), bomba },
        ],
      },
    ]).filas;
    expect(fila?.[10]).toBe(6.75);
    expect(fila?.[11]).toBe(28450);
    expect(fila?.[9]).toBe("D1-BCI010");
  });

  it("sin kilos ni fin mientras sigue en curso", () => {
    const [fila] = tablaHistorial([{ ...base, estado: "EN_CURSO", toneladas: null, tramos: [{ inicio: h("16:00"), fin: null, bomba }] }]).filas;
    expect(fila?.[5]).toBeNull();
    expect(fila?.[10]).toBe(0);
    expect(fila?.[11]).toBeNull();
  });
});
