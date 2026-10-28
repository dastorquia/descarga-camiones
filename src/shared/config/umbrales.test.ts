import { describe, expect, it } from "vitest";
import { validarUmbrales } from "./umbrales";

const base = { kilosMin: "3000", kilosMax: "40000", horasAlertaTramoAbierto: "12" };

describe("umbrales", () => {
  it("acepta los valores iniciales (en kilos) y los guarda en toneladas", () => {
    expect(validarUmbrales(base)).toEqual({ ok: true, valores: { toneladasMin: "3", toneladasMax: "40", horasAlertaTramoAbierto: "12" } });
    expect(validarUmbrales({ ...base, kilosMin: "2.500" })).toMatchObject({ ok: true, valores: { toneladasMin: "2.5" } });
  });

  it("el mínimo tiene que ser menor que el máximo", () => {
    expect(validarUmbrales({ ...base, kilosMin: "40000" }).ok).toBe(false);
  });

  it("rechaza decimales, cero y texto", () => {
    for (const v of ["2500,5", "0", "abc", ""]) expect(validarUmbrales({ ...base, kilosMin: v }).ok, v).toBe(false);
  });

  it("las horas de alerta son enteras entre 1 y 168", () => {
    for (const h of ["0", "169", "1,5", ""]) expect(validarUmbrales({ ...base, horasAlertaTramoAbierto: h }).ok, h).toBe(false);
    expect(validarUmbrales({ ...base, horasAlertaTramoAbierto: "24" }).ok).toBe(true);
  });
});
