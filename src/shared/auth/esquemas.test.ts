import { describe, expect, it } from "vitest";
import { esquemaCambioPin, esquemaPin } from "./esquemas";

describe("formato del PIN", () => {
  it("acepta de 4 a 8 números", () => {
    for (const pin of ["1234", "0000", "12345678"]) expect(esquemaPin.safeParse(pin).success).toBe(true);
  });

  it("rechaza menos de 4, más de 8 o caracteres que no son números", () => {
    for (const pin of ["123", "123456789", "12a4", "12 34", "", "-123"]) {
      expect(esquemaPin.safeParse(pin).success).toBe(false);
    }
  });
});

describe("cambio de PIN", () => {
  it("exige que el PIN nuevo se repita igual", () => {
    expect(esquemaCambioPin.safeParse({ actual: "1234", nuevo: "5678", repetido: "5678" }).success).toBe(true);
    const r = esquemaCambioPin.safeParse({ actual: "1234", nuevo: "5678", repetido: "5679" });
    expect(r.success).toBe(false);
  });

  it("exige que el PIN nuevo tenga formato válido", () => {
    expect(esquemaCambioPin.safeParse({ actual: "1234", nuevo: "12", repetido: "12" }).success).toBe(false);
  });
});
