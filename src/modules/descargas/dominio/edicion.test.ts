import { describe, expect, it } from "vitest";
import { aKilos, desdeKilos, errorEnAsignacion, errorEnTramos, propuestaResto, usaVariasBombas } from "./edicion";

const h = (hora: string, dia = "01") => new Date(`2026-10-${dia}T${hora}:00Z`);
const ahora = h("12:00", "05");

describe("editar tramos", () => {
  const validos = [
    { id: 1, inicio: h("16:00"), fin: h("19:30") },
    { id: 2, inicio: h("06:00", "02"), fin: h("09:15", "02") },
  ];

  it("acepta el caso de la sección 5", () => {
    expect(errorEnTramos(validos, ahora)).toBeNull();
  });

  it("acepta un último tramo en curso", () => {
    expect(errorEnTramos([validos[0]!, { id: 2, inicio: h("06:00", "02"), fin: null }], ahora)).toBeNull();
  });

  it("rechaza fin anterior al inicio", () => {
    expect(errorEnTramos([{ id: 1, inicio: h("16:00"), fin: h("15:00") }], ahora)).toContain("posterior");
  });

  it("rechaza tramos superpuestos dentro de la descarga", () => {
    const solapados = [validos[0]!, { id: 2, inicio: h("19:00"), fin: h("20:00") }];
    expect(errorEnTramos(solapados, ahora)).toContain("antes de que termine");
  });

  it("rechaza un tramo en curso que no sea el último", () => {
    expect(errorEnTramos([{ id: 1, inicio: h("16:00"), fin: null }, validos[1]!], ahora)).toContain("último");
  });

  it("rechaza horas futuras", () => {
    expect(errorEnTramos([{ id: 1, inicio: h("16:00"), fin: h("18:00", "05") }], ahora)).toContain("futuro");
  });
});

describe("kilos", () => {
  it("convierte sin errores de redondeo", () => {
    expect(aKilos("28.450")).toBe(28450);
    expect(aKilos("0.001")).toBe(1);
    expect(desdeKilos(28450)).toBe("28.450");
    expect(desdeKilos(5)).toBe("0.005");
    // 0,1 + 0,2 en kilos da exacto
    expect(desdeKilos(aKilos("0.100") + aKilos("0.200"))).toBe("0.300");
  });
});

describe("asignar toneladas a tramos (dos bombas)", () => {
  it("la suma puede ser igual o menor al total", () => {
    expect(errorEnAsignacion("28.450", ["15.000", "13.450"])).toBeNull();
    expect(errorEnAsignacion("28.450", ["15.000", null])).toBeNull();
  });

  it("la suma no puede superar el total", () => {
    expect(errorEnAsignacion("28.450", ["15.000", "13.451"])).toContain("supera");
  });

  it("al asignar el primer tramo propone el resto para el último", () => {
    expect(propuestaResto("28.450", ["15.000", null])).toEqual({ indice: 1, valor: "13.450" });
  });

  it("no propone si falta más de un tramo o no queda resto", () => {
    expect(propuestaResto("28.450", [null, null])).toBeNull();
    expect(propuestaResto("28.450", ["28.450", null])).toBeNull();
  });

  it("solo aplica si la descarga usó más de una bomba", () => {
    expect(usaVariasBombas([{ bombaId: 1 }, { bombaId: 1 }])).toBe(false);
    expect(usaVariasBombas([{ bombaId: 1 }, { bombaId: 2 }])).toBe(true);
  });
});
