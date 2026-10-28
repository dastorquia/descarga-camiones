import { describe, expect, it } from "vitest";
import { firmarSesion, leerSesion, sesionVigente } from "./token";

const SECRETO = "secreto-de-prueba-con-mas-de-32-caracteres";
const MIN = 60_000;

describe("token de sesión", () => {
  it("se lee lo que se firmó", async () => {
    const token = await firmarSesion({ perfil: "SUPERVISOR", actividad: 1000 }, SECRETO);
    expect(await leerSesion(token, SECRETO)).toEqual({ perfil: "SUPERVISOR", actividad: 1000 });
  });

  it("rechaza un token alterado para hacerse pasar por Supervisor", async () => {
    const token = await firmarSesion({ perfil: "COLABORADOR", actividad: 1000 }, SECRETO);
    const [, firma] = token.split(".");
    const falso = Buffer.from(JSON.stringify({ perfil: "SUPERVISOR", actividad: 1000 })).toString("base64url");
    expect(await leerSesion(`${falso}.${firma}`, SECRETO)).toBeNull();
  });

  it("rechaza un token firmado con otro secreto", async () => {
    const token = await firmarSesion({ perfil: "SUPERVISOR", actividad: 1000 }, SECRETO);
    expect(await leerSesion(token, "otro-secreto-distinto-de-mas-de-32-caracteres")).toBeNull();
  });

  it("rechaza tokens vacíos o mal formados", async () => {
    expect(await leerSesion(undefined, SECRETO)).toBeNull();
    expect(await leerSesion("", SECRETO)).toBeNull();
    expect(await leerSesion("abc", SECRETO)).toBeNull();
    expect(await leerSesion("a.b.c", SECRETO)).toBeNull();
  });

  it("exige un secreto de al menos 32 caracteres", async () => {
    await expect(firmarSesion({ perfil: "SUPERVISOR", actividad: 0 }, "corto")).rejects.toThrow();
  });
});

describe("vencimiento por inactividad", () => {
  it("la sesión de Supervisor vence a los 30 minutos sin actividad", () => {
    const sesion = { perfil: "SUPERVISOR" as const, actividad: 0 };
    expect(sesionVigente(sesion, 29 * MIN)).toBe(true);
    expect(sesionVigente(sesion, 30 * MIN)).toBe(true);
    expect(sesionVigente(sesion, 31 * MIN)).toBe(false);
  });

  it("la sesión de Colaborador sigue vigente después de un turno largo", () => {
    expect(sesionVigente({ perfil: "COLABORADOR", actividad: 0 }, 24 * 60 * MIN)).toBe(true);
  });

  it("rechaza una actividad en el futuro", () => {
    expect(sesionVigente({ perfil: "SUPERVISOR", actividad: 10 * MIN }, 0)).toBe(false);
  });
});
