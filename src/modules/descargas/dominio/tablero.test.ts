import { describe, expect, it } from "vitest";
import { agruparPorSector, estadoBombas, SIN_SECTOR, tramoEnAlerta } from "./tablero";

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

const descarga = (id: number, ...sectores: (string | null)[]) => ({
  id,
  tramos: sectores.map((s) => ({ bomba: { descripcion: s } })),
});

describe("tablero por sector", () => {
  it("agrupa por el sector de la bomba del último tramo", () => {
    const grupos = agruparPorSector(
      ["Descarga 1", "Descarga 2", "Descarga 3"],
      [descarga(1, "Descarga 1"), descarga(2, "Descarga 1", "Descarga 3"), descarga(3, "Descarga 1")],
    );
    expect(grupos.map((g) => [g.sector, g.descargas.map((d) => d.id)])).toEqual([
      ["Descarga 1", [1, 3]],
      ["Descarga 2", []],
      ["Descarga 3", [2]],
    ]);
  });

  it("las bombas sin sector van a un grupo aparte, al final", () => {
    const grupos = agruparPorSector(["Descarga 1"], [descarga(1, null)]);
    expect(grupos.at(-1)).toEqual({ sector: SIN_SECTOR, descargas: [descarga(1, null)] });
  });
});
