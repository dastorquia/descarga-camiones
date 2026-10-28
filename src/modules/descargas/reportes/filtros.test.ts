import { describe, expect, it } from "vitest";
import { leerFiltrosReporte, parametrosReporte } from "./filtros";

const ahora = new Date("2026-10-28T15:00:00Z");

describe("filtros de reportes", () => {
  it("sin parámetros toma el mes en curso hasta hoy, ambos tipos", () => {
    expect(leerFiltrosReporte({}, ahora)).toEqual({ desde: "2026-10-01", hasta: "2026-10-28", tipo: null });
  });

  it("lee el período y el tipo; invierte fechas cruzadas", () => {
    expect(leerFiltrosReporte({ desde: "2026-10-20", hasta: "2026-10-05", tipo: "CARGA" }, ahora)).toEqual({
      desde: "2026-10-05",
      hasta: "2026-10-20",
      tipo: "CARGA",
    });
  });

  it("ignora valores inválidos", () => {
    expect(leerFiltrosReporte({ desde: "ayer", tipo: "OTRO" }, ahora)).toEqual({ desde: "2026-10-01", hasta: "2026-10-28", tipo: null });
  });

  it("arma los parámetros para exportar con los mismos filtros", () => {
    expect(parametrosReporte({ desde: "2026-10-01", hasta: "2026-10-28", tipo: "DESCARGA" })).toBe("desde=2026-10-01&hasta=2026-10-28&tipo=DESCARGA");
  });
});
