import { describe, expect, it } from "vitest";
import { aDiaHora, desdeDiaHora, formatearFechaHora, formatearHora } from "./fechas";

describe("fechas en hora de Argentina", () => {
  it("convierte día y hora de Argentina a UTC (UTC−3)", () => {
    expect(desdeDiaHora("2026-10-01", "16:00")?.toISOString()).toBe("2026-10-01T19:00:00.000Z");
    expect(desdeDiaHora("2026-10-01", "22:30")?.toISOString()).toBe("2026-10-02T01:30:00.000Z");
    expect(desdeDiaHora("2026-10-02", "00:00")?.toISOString()).toBe("2026-10-02T03:00:00.000Z");
  });

  it("vuelve de UTC a día y hora de Argentina", () => {
    expect(aDiaHora(new Date("2026-10-02T01:30:00Z"))).toEqual({ dia: "2026-10-01", hora: "22:30" });
  });

  it("rechaza formatos y fechas inválidas", () => {
    expect(desdeDiaHora("2026-02-31", "10:00")).toBeNull();
    expect(desdeDiaHora("01/10/2026", "10:00")).toBeNull();
    expect(desdeDiaHora("2026-10-01", "24:00")).toBeNull();
    expect(desdeDiaHora("2026-10-01", "9:00")).toBeNull();
    expect(desdeDiaHora("", "")).toBeNull();
  });

  it("muestra en formato argentino", () => {
    const fecha = new Date("2026-10-01T19:00:00Z");
    expect(formatearFechaHora(fecha)).toBe("01/10/2026 16:00");
    expect(formatearHora(fecha)).toBe("16:00");
  });
});
