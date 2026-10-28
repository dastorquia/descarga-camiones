import { describe, expect, it } from "vitest";
import { desdeDiaHora } from "@/shared/lib/fechas";
import { formatearHoras, horasBomba, horasTramo } from "./horas";

const ar = (dia: string, hora: string) => {
  const fecha = desdeDiaHora(dia, hora);
  if (!fecha) throw new Error(`fecha inválida ${dia} ${hora}`);
  return fecha;
};

describe("horas de bomba", () => {
  it("caso obligatorio de la sección 5: pausa nocturna da 6,75 h y no 17 h", () => {
    const tramos = [
      { inicio: ar("2026-10-01", "16:00"), fin: ar("2026-10-01", "19:30") },
      { inicio: ar("2026-10-02", "06:00"), fin: ar("2026-10-02", "09:15") },
    ];
    expect(horasTramo(tramos[0]!)).toBe(3.5);
    expect(horasTramo(tramos[1]!)).toBe(3.25);
    expect(horasBomba(tramos)).toBe(6.75);
    expect(formatearHoras(horasBomba(tramos))).toBe("6,75 h");
  });

  it("un tramo abierto no suma horas ni se calcula con la hora actual", () => {
    const tramos = [
      { inicio: ar("2026-10-01", "16:00"), fin: ar("2026-10-01", "19:30") },
      { inicio: ar("2026-10-02", "06:00"), fin: null },
    ];
    expect(horasTramo(tramos[1]!)).toBeNull();
    expect(horasBomba(tramos)).toBe(3.5);
  });

  it("un tramo que cruza la medianoche se calcula entero", () => {
    expect(horasBomba([{ inicio: ar("2026-10-01", "22:00"), fin: ar("2026-10-02", "02:30") }])).toBe(4.5);
  });

  it("sin tramos cerrados da 0", () => {
    expect(horasBomba([])).toBe(0);
    expect(formatearHoras(0)).toBe("0,00 h");
  });
});
