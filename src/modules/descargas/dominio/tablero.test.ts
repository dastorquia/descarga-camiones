import { describe, expect, it } from "vitest";
import { estadoBombas, sectorDe, SIN_SECTOR, tramoEnAlerta } from "./tablero";

describe("alerta de tramo abierto", () => {
  const inicio = new Date("2026-10-28T00:00:00Z");
  const despues = (h: number) => new Date(inicio.getTime() + h * 3_600_000);

  it("se marca recién al pasar las horas configuradas (12 por defecto)", () => {
    expect(tramoEnAlerta(inicio, despues(11.9), 12)).toBe(false);
    expect(tramoEnAlerta(inicio, despues(12), 12)).toBe(false);
    expect(tramoEnAlerta(inicio, despues(12.1), 12)).toBe(true);
  });

  it("respeta un umbral configurado distinto", () => {
    expect(tramoEnAlerta(inicio, despues(7), 6)).toBe(true);
  });
});

describe("estado de bombas", () => {
  it("indica libre u ocupada y por qué descarga", () => {
    const bombas = [
      { id: 1, codigo: "BCI010", sector: "Descarga 1" },
      { id: 2, codigo: "BEL012", sector: "Descarga 2" },
    ];
    const desde = new Date("2026-10-28T10:00:00Z");
    const estado = estadoBombas(bombas, [{ bombaId: 2, inicio: desde, descarga: { id: 7, hojaDeRuta: "HR7" } }]);
    expect(estado[0]!.ocupadaPor).toBeNull();
    expect(estado[1]!.ocupadaPor).toEqual({ descargaId: 7, hojaDeRuta: "HR7", desde });
    expect(estado[0]!.mantenimiento).toBeNull();
  });

  it("indica las bombas en mantenimiento", () => {
    const bombas = [{ id: 1, codigo: "BCI010", sector: "Descarga 1" }];
    const desde = new Date("2026-10-29T10:00:00Z");
    const [b] = estadoBombas(bombas, [], [{ bombaId: 1, desde, motivo: "Cambio de sello" }]);
    expect(b!.mantenimiento).toEqual({ desde, motivo: "Cambio de sello" });
    expect(b!.ocupadaPor).toBeNull();
  });
});

describe("sector de una descarga", () => {
  it("es el de la bomba del último tramo; sin sector, va aparte", () => {
    const tramos = (...sectores: (string | null)[]) => ({ tramos: sectores.map((s) => ({ bomba: { descripcion: s } })) });
    expect(sectorDe(tramos("Descarga 1", "Descarga 3"))).toBe("Descarga 3");
    expect(sectorDe(tramos(null))).toBe(SIN_SECTOR);
    expect(sectorDe(tramos())).toBe(SIN_SECTOR);
  });
});
