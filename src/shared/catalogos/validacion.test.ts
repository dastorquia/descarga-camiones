import { describe, expect, it } from "vitest";
import { esCatalogo, normalizarCodigoBomba, normalizarNombre, normalizarSector, normalizarTanque } from "./validacion";

describe("normalización de catálogos", () => {
  it("tanques: TK-001 (con 3 dígitos) y otros prefijos como PLT-801", () => {
    expect(normalizarTanque("tk1")).toEqual({ ok: true, valor: "TK-001" });
    expect(normalizarTanque("TK 120")).toEqual({ ok: true, valor: "TK-120" });
    expect(normalizarTanque("TK-012")).toEqual({ ok: true, valor: "TK-012" });
    expect(normalizarTanque("TK-25")).toEqual({ ok: true, valor: "TK-025" });
    expect(normalizarTanque("plt801")).toEqual({ ok: true, valor: "PLT-801" });
    for (const t of ["", "T-1", "TK-12345", "TKA", "PLT-8A"]) expect(normalizarTanque(t).ok, t).toBe(false);
  });

  it("código de bomba en mayúsculas, solo letras y números", () => {
    expect(normalizarCodigoBomba(" bel 099 ")).toEqual({ ok: true, valor: "BEL099" });
    expect(normalizarCodigoBomba("BEL-1").ok).toBe(false);
  });

  it("nombres sin espacios de más", () => {
    expect(normalizarNombre("  Aceite   de  soja ")).toEqual({ ok: true, valor: "Aceite de soja" });
    expect(normalizarNombre("   ").ok).toBe(false);
  });

  it("el sector es opcional", () => {
    expect(normalizarSector("  Descarga  4 ")).toEqual({ ok: true, valor: "Descarga 4" });
    expect(normalizarSector("")).toEqual({ ok: true, valor: "" });
  });

  it("solo acepta catálogos conocidos", () => {
    expect(esCatalogo("bombas")).toBe(true);
    expect(esCatalogo("config")).toBe(false);
    expect(esCatalogo("toString")).toBe(false);
  });
});
