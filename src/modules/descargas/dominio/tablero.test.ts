import { describe, expect, it } from "vitest";
import { agruparPorSector, SIN_SECTOR } from "./tablero";

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
