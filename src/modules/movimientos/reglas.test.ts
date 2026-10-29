import { describe, expect, it } from "vitest";
import { errorEnMovimiento, intervalosDeMovimiento } from "./reglas";

const h = (hora: string) => new Date(`2026-10-01T${hora}:00Z`);
const base = { inicio: h("10:00"), fin: h("12:00"), tanqueOrigenId: 1, tanqueDestinoId: 2, bombaCargaId: 1, bombaDescargaId: 2 };
const ahora = new Date("2026-10-05T00:00:00Z");

describe("movimiento interno", () => {
  it("acepta un movimiento válido", () => {
    expect(errorEnMovimiento(base, ahora)).toBeNull();
  });

  it("rechaza tanques o bombas iguales, fin no posterior y fin futuro", () => {
    expect(errorEnMovimiento({ ...base, tanqueDestinoId: 1 }, ahora)).toContain("tanque");
    expect(errorEnMovimiento({ ...base, bombaDescargaId: 1 }, ahora)).toContain("bomba");
    expect(errorEnMovimiento({ ...base, fin: h("10:00") }, ahora)).toContain("posterior");
    expect(errorEnMovimiento({ ...base, fin: new Date("2026-10-06T00:00:00Z") }, ahora)).toContain("futura");
  });

  it("aporta horas a las dos bombas", () => {
    expect(intervalosDeMovimiento(base).map((i) => i.bombaId)).toEqual([1, 2]);
  });
});
