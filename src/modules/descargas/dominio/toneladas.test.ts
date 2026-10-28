import { describe, expect, it } from "vitest";
import { advertenciaKilos, aKilosDesdeBase, formatearKilos, interpretarKilos, kilosATexto } from "./toneladas";

describe("interpretar kilos", () => {
  it("acepta kilos enteros, con o sin punto de miles", () => {
    expect(interpretarKilos("28000")).toEqual({ ok: true, kilos: 28000, valor: "28.000" });
    expect(interpretarKilos("28.450")).toEqual({ ok: true, kilos: 28450, valor: "28.450" });
    expect(interpretarKilos(" 1.234.567 kg ")).toEqual({ ok: true, kilos: 1234567, valor: "1234.567" });
    expect(interpretarKilos("5")).toEqual({ ok: true, kilos: 5, valor: "0.005" });
  });

  it("rechaza decimales, vacío, cero, texto y puntos mal puestos", () => {
    for (const texto of ["", "0", "28,5", "abc", "28.45", "2.80.000", "-100", "99999999"]) {
      expect(interpretarKilos(texto).ok, texto).toBe(false);
    }
  });
});

describe("conversión con la base (toneladas con 3 decimales)", () => {
  it("ida y vuelta sin perder un kilo", () => {
    expect(kilosATexto(28450)).toBe("28.450");
    expect(aKilosDesdeBase("28.45")).toBe(28450);
    expect(aKilosDesdeBase("0.001")).toBe(1);
    expect(aKilosDesdeBase(kilosATexto(1234567))).toBe(1234567);
  });
});

describe("advertencia de rango (no bloquea)", () => {
  it("no advierte entre 3.000 y 40.000 kg, incluidos los extremos", () => {
    for (const k of [3000, 28000, 40000]) expect(advertenciaKilos(k, 3000, 40000)).toBeNull();
  });

  it("advierte errores de tipeo típicos: 2.800.000 o 280", () => {
    expect(advertenciaKilos(2_800_000, 3000, 40000)).toContain("2.800.000 kg");
    expect(advertenciaKilos(280, 3000, 40000)).toContain("fuera de lo habitual");
  });
});

describe("mostrar kilos", () => {
  it("muestra — cuando todavía no se cargaron, nunca 0", () => {
    expect(formatearKilos(null)).toBe("—");
    expect(formatearKilos(undefined)).toBe("—");
  });

  it("muestra kilos con punto de miles y la unidad kg", () => {
    expect(formatearKilos("28.45")).toBe("28.450 kg");
    expect(formatearKilos("0.005")).toBe("5 kg");
  });
});
