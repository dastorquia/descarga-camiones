import { describe, expect, it } from "vitest";
import { advertenciaToneladas, formatearToneladas, interpretarToneladas } from "./toneladas";

describe("interpretar toneladas", () => {
  it("acepta coma decimal y hasta 3 decimales", () => {
    expect(interpretarToneladas("28,450")).toEqual({ ok: true, valor: "28.450" });
    expect(interpretarToneladas("28")).toEqual({ ok: true, valor: "28.000" });
    expect(interpretarToneladas("28,5")).toEqual({ ok: true, valor: "28.500" });
    expect(interpretarToneladas(" 28,45 t ")).toEqual({ ok: true, valor: "28.450" });
    expect(interpretarToneladas("0,001")).toEqual({ ok: true, valor: "0.001" });
  });

  it("rechaza el punto para no confundir 28.450 con veintiocho mil", () => {
    expect(interpretarToneladas("28.450").ok).toBe(false);
  });

  it("rechaza vacío, cero, negativos, más de 3 decimales y texto", () => {
    for (const texto of ["", "0", "0,000", "-5", "28,4501", "abc", "28,", ",5"]) {
      expect(interpretarToneladas(texto).ok, texto).toBe(false);
    }
  });
});

describe("advertencia de rango (no bloquea)", () => {
  it("no advierte dentro de 3 a 40 t, incluidos los extremos", () => {
    for (const v of ["3.000", "28.000", "40.000"]) expect(advertenciaToneladas(v, 3, 40)).toBeNull();
  });

  it("advierte errores de tipeo típicos: 2800 o 2,8", () => {
    expect(advertenciaToneladas("2800.000", 3, 40)).toContain("2.800,000 t");
    expect(advertenciaToneladas("2.800", 3, 40)).toContain("fuera de lo habitual");
  });
});

describe("mostrar toneladas", () => {
  it("muestra — cuando todavía no se cargaron, nunca 0", () => {
    expect(formatearToneladas(null)).toBe("—");
    expect(formatearToneladas(undefined)).toBe("—");
  });

  it("muestra 3 decimales con coma y la unidad t", () => {
    expect(formatearToneladas("28.45")).toBe("28,450 t");
  });
});
