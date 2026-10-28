import { describe, expect, it } from "vitest";
import { validarUmbrales } from "./umbrales";

const base = { toneladasMin: "3", toneladasMax: "40", horasAlertaTramoAbierto: "12" };

describe("umbrales", () => {
  it("acepta los valores iniciales y coma decimal", () => {
    expect(validarUmbrales(base)).toEqual({ ok: true, valores: base });
    expect(validarUmbrales({ ...base, toneladasMin: "2,5" })).toEqual({ ok: true, valores: { ...base, toneladasMin: "2.5" } });
  });

  it("el mínimo tiene que ser menor que el máximo", () => {
    expect(validarUmbrales({ ...base, toneladasMin: "40" }).ok).toBe(false);
  });

  it("rechaza punto decimal, cero y texto", () => {
    for (const v of ["2.5", "0", "abc", ""]) expect(validarUmbrales({ ...base, toneladasMin: v }).ok, v).toBe(false);
  });

  it("las horas de alerta son enteras entre 1 y 168", () => {
    for (const h of ["0", "169", "1,5", ""]) expect(validarUmbrales({ ...base, horasAlertaTramoAbierto: h }).ok, h).toBe(false);
    expect(validarUmbrales({ ...base, horasAlertaTramoAbierto: "24" }).ok).toBe(true);
  });
});
