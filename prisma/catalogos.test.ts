import { describe, expect, it } from "vitest";
import { BOMBAS, TANQUES } from "./catalogos";

describe("catálogos del seed", () => {
  it("genera los tanques TK y PLT", () => {
    expect(TANQUES).toHaveLength(38);
    expect(TANQUES).toContain("TK-025");
    expect(TANQUES).toContain("PLT-802");
    expect(TANQUES[0]).toBe("TK-001");
    expect(TANQUES).toContain("TK-012");
    expect(TANQUES).not.toContain("TK-013");
    expect(TANQUES).toContain("TK-101");
    expect(TANQUES).toContain("TK-119");
    for (const codigo of TANQUES) expect(codigo).toMatch(/^(TK|PLT)-\d{3}$/);
  });

  it("asigna sector a cada bomba", () => {
    expect(BOMBAS).toHaveLength(9);
    for (const bomba of BOMBAS) expect(bomba.descripcion).toMatch(/^Descarga [1-4]$/);
  });
});
