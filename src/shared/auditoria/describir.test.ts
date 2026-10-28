import { describe, expect, it } from "vitest";
import { describirCambios } from "./describir";

describe("describir cambios de la auditoría", () => {
  it("muestra nombres en lugar de ids", () => {
    const cambios = describirCambios({ productoId: 4 }, { productoId: 1 }, { productoId: { 1: "Borra", 4: "Aceite" } });
    expect(cambios).toEqual([{ campo: "Producto", antes: "Aceite", despues: "Borra" }]);
  });

  it("muestra fechas en hora de Argentina y toneladas con coma", () => {
    const cambios = describirCambios(
      { fin: "2026-10-27T22:30:00.000Z", toneladas: "28.45" },
      { fin: "2026-10-27T22:45:00.000Z", toneladas: "28.450" },
    );
    expect(cambios).toEqual([
      { campo: "Fin", antes: "27/10/2026 19:30", despues: "27/10/2026 19:45" },
      { campo: "Kilos", antes: "28.450 kg", despues: "28.450 kg" },
    ]);
  });

  it("en un alta no hay valor anterior, y no muestra datos vacíos de los dos lados", () => {
    expect(describirCambios(null, { valor: "TK-120", sector: null })).toEqual([
      { campo: "Nombre o código", antes: "—", despues: "TK-120" },
    ]);
  });

  it("ordena los datos de forma lógica (inicio antes que fin)", () => {
    const cambios = describirCambios(null, { fin: "2026-10-27T23:00:00.000Z", inicio: "2026-10-27T22:00:00.000Z", bombaId: 1 }, { bombaId: { 1: "D1-BCI010" } });
    expect(cambios.map((c) => c.campo)).toEqual(["Bomba", "Inicio", "Fin"]);
  });

  it("traduce estados, booleanos y oculta campos internos", () => {
    expect(describirCambios({ activo: true, estado: "EN_CURSO", descargaId: 5 }, { activo: false, estado: "PAUSADA", descargaId: 5 })).toEqual([
      { campo: "Estado", antes: "En curso", despues: "Pausada" },
      { campo: "Activo", antes: "Sí", despues: "No" },
    ]);
  });

  it("resume las toneladas por tramo", () => {
    const [cambio] = describirCambios({ tramos: [{ id: 1, toneladas: null }] }, { tramos: [{ id: 1, toneladas: "15.000" }] });
    expect(cambio).toEqual({ campo: "Kilos por tramo", antes: "tramo #1: —", despues: "tramo #1: 15.000 kg" });
  });

  it("un id sin nombre conocido se muestra con #", () => {
    expect(describirCambios({ bombaId: 99 }, {}, { bombaId: {} })[0]?.antes).toBe("#99");
  });
});
