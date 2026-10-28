import { describe, expect, it } from "vitest";
import { enlaceAuditoria, leerFiltrosAuditoria } from "./filtros";

describe("filtros de auditoría", () => {
  it("lee filtros válidos e ignora los inválidos", () => {
    expect(leerFiltrosAuditoria({ grupo: "catalogos", accion: "ELIMINAR", desde: "2026-10-01", descargaId: "32" })).toEqual({
      grupo: "catalogos",
      accion: "ELIMINAR",
      desde: "2026-10-01",
      hasta: null,
      descargaId: 32,
      pagina: 1,
    });
    expect(leerFiltrosAuditoria({ grupo: "toString", accion: "BORRAR", descargaId: "x", pagina: "-2" })).toMatchObject({
      grupo: null,
      accion: null,
      descargaId: null,
      pagina: 1,
    });
  });

  it("arma enlaces de página conservando los filtros", () => {
    expect(enlaceAuditoria(leerFiltrosAuditoria({ descargaId: "7" }), 2)).toBe("/supervisor/auditoria?descargaId=7&pagina=2");
  });
});
