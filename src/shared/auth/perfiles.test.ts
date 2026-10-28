import { describe, expect, it } from "vitest";
import { esPerfil, perfilesDeRuta, puede } from "./perfiles";

describe("permisos por perfil", () => {
  it("ambos perfiles operan descargas", () => {
    expect(puede("COLABORADOR", "descargas.operar")).toBe(true);
    expect(puede("SUPERVISOR", "descargas.operar")).toBe(true);
  });

  it("solo el Supervisor cambia el PIN, edita finalizadas, asigna toneladas y administra", () => {
    for (const permiso of [
      "pin.cambiar",
      "descargas.editarFinalizadas",
      "tramos.asignarToneladas",
      "catalogos.administrar",
      "configuracion.administrar",
      "reportes.ver",
    ] as const) {
      expect(puede("COLABORADOR", permiso)).toBe(false);
      expect(puede("SUPERVISOR", permiso)).toBe(true);
    }
  });

  it("reconoce solo los perfiles válidos", () => {
    expect(esPerfil("SUPERVISOR")).toBe(true);
    expect(esPerfil("supervisor")).toBe(false);
    expect(esPerfil("ADMIN")).toBe(false);
  });
});

describe("rutas protegidas", () => {
  it("/supervisor y sus subrutas son solo para el Supervisor", () => {
    expect(perfilesDeRuta("/supervisor")).toEqual(["SUPERVISOR"]);
    expect(perfilesDeRuta("/supervisor/cambiar-pin")).toEqual(["SUPERVISOR"]);
  });

  it("los datos del tablero del Supervisor también son solo para el Supervisor", () => {
    expect(perfilesDeRuta("/api/supervisor/tablero")).toEqual(["SUPERVISOR"]);
    expect(puede("COLABORADOR", "tablero.supervisor")).toBe(false);
  });

  it("/colaborador es para ambos perfiles", () => {
    expect(perfilesDeRuta("/colaborador")).toEqual(["COLABORADOR", "SUPERVISOR"]);
  });

  it("la verificación y la entrada del Supervisor son públicas", () => {
    expect(perfilesDeRuta("/")).toBeNull();
    expect(perfilesDeRuta("/entrar")).toBeNull();
    expect(perfilesDeRuta("/supervisores")).toBeNull();
  });
});
