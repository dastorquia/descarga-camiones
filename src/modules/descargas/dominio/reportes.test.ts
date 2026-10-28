import { describe, expect, it } from "vitest";
import { desdeDiaHora } from "@/shared/lib/fechas";
import {
  horasPorBombaPorDia,
  horasPorBombaPorMes,
  repartirPorDia,
  resumenDescarga,
  toneladasPor,
  toneladasPorBomba,
  type DescargaReporte,
} from "./reportes";

const ar = (dia: string, hora: string) => desdeDiaHora(dia, hora)!;
const rangoOctubre = { desde: ar("2026-10-01", "00:00"), hasta: ar("2026-11-01", "00:00") };

/** Caso de la sección 5: 16:00–19:30 del día 1 y 06:00–09:15 del día 2, 28.450 kg. */
const caso675: DescargaReporte = {
  id: 1,
  hojaDeRuta: "HR1",
  tipo: "DESCARGA",
  estado: "FINALIZADA",
  productoId: 1,
  proveedorId: 1,
  tanqueId: 1,
  toneladas: "28.450",
  tramos: [
    { bombaId: 1, inicio: ar("2026-10-01", "16:00"), fin: ar("2026-10-01", "19:30"), toneladas: null },
    { bombaId: 1, inicio: ar("2026-10-02", "06:00"), fin: ar("2026-10-02", "09:15"), toneladas: null },
  ],
};

describe("repartir horas por día (medianoche de Argentina)", () => {
  it("un tramo de 22:00 a 02:00 da 2 h a cada día", () => {
    expect(repartirPorDia(ar("2026-10-01", "22:00"), ar("2026-10-02", "02:00"))).toEqual([
      { dia: "2026-10-01", horas: 2 },
      { dia: "2026-10-02", horas: 2 },
    ]);
  });

  it("un tramo de más de un día se reparte en todos", () => {
    const partes = repartirPorDia(ar("2026-10-30", "20:00"), ar("2026-11-01", "04:00"));
    expect(partes).toEqual([
      { dia: "2026-10-30", horas: 4 },
      { dia: "2026-10-31", horas: 24 },
      { dia: "2026-11-01", horas: 4 },
    ]);
  });

  it("un tramo dentro del mismo día no se corta", () => {
    expect(repartirPorDia(ar("2026-10-01", "16:00"), ar("2026-10-01", "19:30"))).toEqual([{ dia: "2026-10-01", horas: 3.5 }]);
  });
});

describe("horas por bomba", () => {
  it("caso de la sección 5: 3,50 h el día 1 y 3,25 h el día 2; 6,75 h en el mes", () => {
    const porDia = horasPorBombaPorDia([caso675], rangoOctubre);
    expect(porDia).toEqual([
      { bombaId: 1, dia: "2026-10-01", horas: 3.5 },
      { bombaId: 1, dia: "2026-10-02", horas: 3.25 },
    ]);
    expect(horasPorBombaPorMes(porDia)).toEqual([{ bombaId: 1, mes: "2026-10", horas: 6.75 }]);
  });

  it("los tramos abiertos no suman horas", () => {
    const abierta: DescargaReporte = { ...caso675, estado: "EN_CURSO", toneladas: null, tramos: [{ ...caso675.tramos[0]!, fin: null }] };
    expect(horasPorBombaPorDia([abierta], rangoOctubre)).toEqual([]);
  });

  it("recorta los tramos al rango del reporte", () => {
    const rango = { desde: ar("2026-10-02", "00:00"), hasta: ar("2026-10-03", "00:00") };
    expect(horasPorBombaPorDia([caso675], rango)).toEqual([{ bombaId: 1, dia: "2026-10-02", horas: 3.25 }]);
  });
});

describe("resumen de una descarga", () => {
  it("tiempo total frente a bombeo efectivo: la diferencia son las pausas", () => {
    const r = resumenDescarga(caso675);
    expect(r.horasBombeo).toBe(6.75);
    expect(r.horasTotales).toBe(17.25);
    expect(r.horasPausa).toBe(10.5);
    expect(r.rendimiento).toBeCloseTo(28450 / 6.75, 10);
    expect(r.fin).toEqual(ar("2026-10-02", "09:15"));
  });

  it("sin toneladas no hay rendimiento; con un tramo abierto no hay tiempo total", () => {
    const r = resumenDescarga({ ...caso675, estado: "EN_CURSO", toneladas: null, tramos: [caso675.tramos[0]!, { ...caso675.tramos[1]!, fin: null }] });
    expect(r.rendimiento).toBeNull();
    expect(r.horasTotales).toBeNull();
    expect(r.horasBombeo).toBe(3.5);
  });
});

describe("toneladas y rendimiento por bomba", () => {
  it("con una sola bomba es exacto", () => {
    expect(toneladasPorBomba([caso675])).toEqual([
      { bombaId: 1, tipo: "DESCARGA", kilos: 28450, horas: 6.75, rendimiento: 28450 / 6.75, asignacionManual: false, descargas: 1 },
    ]);
  });

  it("con dos bombas usa las toneladas asignadas y lo marca como asignación manual", () => {
    const dosBombas: DescargaReporte = {
      ...caso675,
      tramos: [
        { ...caso675.tramos[0]!, bombaId: 1, toneladas: "15.000" },
        { ...caso675.tramos[1]!, bombaId: 2, toneladas: "13.450" },
      ],
    };
    const r = toneladasPorBomba([dosBombas]);
    expect(r.map((b) => [b.bombaId, b.kilos, b.horas, b.asignacionManual])).toEqual([
      [1, 15000, 3.5, true],
      [2, 13450, 3.25, true],
    ]);
  });

  it("con dos bombas, los tramos sin asignar quedan afuera", () => {
    const parcial: DescargaReporte = {
      ...caso675,
      tramos: [
        { ...caso675.tramos[0]!, bombaId: 1, toneladas: "15.000" },
        { ...caso675.tramos[1]!, bombaId: 2, toneladas: null },
      ],
    };
    expect(toneladasPorBomba([parcial]).map((b) => b.bombaId)).toEqual([1]);
  });

  it("separa descargas y cargas, y omite las no finalizadas", () => {
    const carga: DescargaReporte = { ...caso675, id: 2, tipo: "CARGA" };
    const enCurso: DescargaReporte = { ...caso675, id: 3, estado: "EN_CURSO", toneladas: null };
    expect(toneladasPorBomba([caso675, carga, enCurso]).map((b) => b.tipo)).toEqual(["CARGA", "DESCARGA"]);
  });
});

describe("toneladas por producto, proveedor y tanque", () => {
  it("suma por clave y separa descarga y carga", () => {
    const otra: DescargaReporte = { ...caso675, id: 2, tipo: "CARGA", toneladas: "10.000" };
    const tercera: DescargaReporte = { ...caso675, id: 3, productoId: 2, toneladas: "5.500" };
    expect(toneladasPor("productoId", [caso675, otra, tercera])).toEqual([
      { id: 1, descarga: 28450, carga: 10000 },
      { id: 2, descarga: 5500, carga: 0 },
    ]);
  });
});
