import { describe, expect, it } from "vitest";
import { enlaceDePagina, leerFiltros } from "./filtros";

describe("filtros del historial", () => {
  it("sin parámetros no filtra nada y arranca en la página 1", () => {
    const f = leerFiltros({});
    expect(f.pagina).toBe(1);
    expect(Object.entries(f).filter(([k, v]) => k !== "pagina" && v !== null)).toEqual([]);
  });

  it("lee y normaliza los filtros", () => {
    const f = leerFiltros({ desde: "2026-10-01", estado: "FINALIZADA", tipo: "CARGA", bombaId: "3", texto: " hr-12 ", pagina: "2" });
    expect(f).toMatchObject({ desde: "2026-10-01", estado: "FINALIZADA", tipo: "CARGA", bombaId: 3, texto: "HR12", pagina: 2 });
  });

  it("ignora valores inválidos", () => {
    const f = leerFiltros({ desde: "ayer", estado: "BORRADA", bombaId: "-1", productoId: "abc", pagina: "0" });
    expect(f).toMatchObject({ desde: null, estado: null, bombaId: null, productoId: null, pagina: 1 });
  });

  it("arma enlaces de página conservando los filtros", () => {
    const f = leerFiltros({ estado: "PAUSADA", tanqueId: "13" });
    expect(enlaceDePagina(f, 2)).toBe("/colaborador/historial?estado=PAUSADA&tanqueId=13&pagina=2");
    expect(enlaceDePagina(f, 1)).toBe("/colaborador/historial?estado=PAUSADA&tanqueId=13");
  });
});
