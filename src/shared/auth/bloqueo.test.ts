import { describe, expect, it } from "vitest";
import { bloqueadoHasta, LIMITE_FALLIDOS, minutosRestantes, registrarFallo, SIN_INTENTOS } from "./bloqueo";

const t0 = new Date("2026-10-28T12:00:00Z");
const masMinutos = (m: number) => new Date(t0.getTime() + m * 60_000);

function fallar(veces: number, limite: number = LIMITE_FALLIDOS.dispositivo) {
  let estado = SIN_INTENTOS;
  for (let i = 0; i < veces; i++) estado = registrarFallo(estado, limite, t0);
  return estado;
}

describe("bloqueo por intentos fallidos de PIN", () => {
  it("4 intentos fallidos no bloquean", () => {
    const estado = fallar(4);
    expect(estado.fallidos).toBe(4);
    expect(bloqueadoHasta(estado, t0)).toBeNull();
  });

  it("el 5.º intento fallido bloquea 5 minutos", () => {
    const estado = fallar(5);
    expect(bloqueadoHasta(estado, t0)).toEqual(masMinutos(5));
    expect(bloqueadoHasta(estado, masMinutos(4.9))).not.toBeNull();
    expect(minutosRestantes(masMinutos(5), t0)).toBe(5);
  });

  it("pasados los 5 minutos se desbloquea y la cuenta vuelve a cero", () => {
    const bloqueado = fallar(5);
    expect(bloqueadoHasta(bloqueado, masMinutos(5))).toBeNull();
    const otroFallo = registrarFallo(bloqueado, LIMITE_FALLIDOS.dispositivo, masMinutos(6));
    expect(otroFallo).toEqual({ fallidos: 1, bloqueadoHasta: null });
  });

  it("por IP se tolera más intentos (la planta comparte IP)", () => {
    expect(bloqueadoHasta(fallar(19, LIMITE_FALLIDOS.ip), t0)).toBeNull();
    expect(bloqueadoHasta(fallar(20, LIMITE_FALLIDOS.ip), t0)).not.toBeNull();
  });

  it("los minutos restantes nunca muestran 0", () => {
    expect(minutosRestantes(new Date(t0.getTime() + 5_000), t0)).toBe(1);
  });
});
