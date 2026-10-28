import { describe, expect, it } from "vitest";
import { BOMBAS, TANQUES } from "./catalogos";

describe("catálogos del seed", () => {
  it("genera TK-001 a TK-012 y TK-101 a TK-119", () => {
    expect(TANQUES).toHaveLength(31);
    expect(TANQUES[0]).toBe("TK-001");
    expect(TANQUES).toContain("TK-012");
    expect(TANQUES).not.toContain("TK-013");
    expect(TANQUES).toContain("TK-101");
    expect(TANQUES.at(-1)).toBe("TK-119");
    for (const codigo of TANQUES) expect(codigo).toMatch(/^TK-\d{3}$/);
  });

  it("asigna sector a cada bomba", () => {
    expect(BOMBAS).toHaveLength(7);
    for (const bomba of BOMBAS) expect(bomba.descripcion).toMatch(/^Descarga [123]$/);
  });
});
