import { describe, expect, it } from "vitest";
import {
  errorAlAbrir,
  errorAlCerrar,
  esFuturo,
  normalizarHojaDeRuta,
  normalizarPatente,
  operacionPermitida,
  tramoSolapado,
} from "./reglas";

const h = (hora: string, dia = "01") => new Date(`2026-10-${dia}T${hora}:00Z`);
const ahora = h("12:00", "05");

describe("hoja de ruta", () => {
  it("quita espacios y pasa a mayúsculas", () => {
    expect(normalizarHojaDeRuta(" hr 123 ")).toEqual({ ok: true, valor: "HR123" });
  });

  it("rechaza vacía y caracteres especiales", () => {
    for (const texto of ["", "   ", "HR-123", "HR/1", "HR.1", "Ñ12"]) {
      expect(normalizarHojaDeRuta(texto).ok, texto).toBe(false);
    }
  });

  it("la patente es obligatoria y se normaliza", () => {
    expect(normalizarPatente("  ab 123 cd ")).toEqual({ ok: true, valor: "AB123CD" });
    expect(normalizarPatente("  ").ok).toBe(false);
  });

  it("la patente rechaza caracteres especiales", () => {
    for (const texto of ["AB-123-CD", "AB.123", "AB_1", "ÑA123"]) {
      expect(normalizarPatente(texto).ok, texto).toBe(false);
    }
  });
});

describe("estados", () => {
  it("pausar solo en curso, reanudar solo pausada", () => {
    expect(operacionPermitida("EN_CURSO", "pausar")).toBe(true);
    expect(operacionPermitida("PAUSADA", "pausar")).toBe(false);
    expect(operacionPermitida("PAUSADA", "reanudar")).toBe(true);
    expect(operacionPermitida("EN_CURSO", "reanudar")).toBe(false);
  });

  it("una descarga finalizada no admite ninguna operación (no se reabre)", () => {
    for (const op of ["pausar", "reanudar", "finalizar"] as const) {
      expect(operacionPermitida("FINALIZADA", op)).toBe(false);
    }
  });
});

describe("horas futuras", () => {
  it("tolera hasta 5 minutos por relojes adelantados", () => {
    expect(esFuturo(new Date(ahora.getTime() + 5 * 60_000), ahora)).toBe(false);
    expect(esFuturo(new Date(ahora.getTime() + 6 * 60_000), ahora)).toBe(true);
  });
});

describe("cerrar un tramo (pausar o finalizar)", () => {
  const tramo = { inicio: h("16:00"), fin: null };

  it("el fin tiene que ser posterior al inicio", () => {
    expect(errorAlCerrar(tramo, h("16:00"), ahora)).not.toBeNull();
    expect(errorAlCerrar(tramo, h("15:00"), ahora)).not.toBeNull();
    expect(errorAlCerrar(tramo, h("19:30"), ahora)).toBeNull();
  });

  it("el fin no puede ser futuro", () => {
    expect(errorAlCerrar(tramo, h("13:00", "05"), ahora)).toContain("futura");
  });
});

describe("abrir un tramo (iniciar o reanudar)", () => {
  const anteriores = [{ inicio: h("16:00"), fin: h("19:30") }];

  it("tiene que empezar después del fin del tramo anterior", () => {
    expect(errorAlAbrir(h("19:00"), anteriores, ahora)).toContain("después del fin");
    expect(errorAlAbrir(h("19:30"), anteriores, ahora)).toBeNull();
    expect(errorAlAbrir(h("06:00", "02"), anteriores, ahora)).toBeNull();
  });

  it("no puede haber dos tramos abiertos en la misma descarga", () => {
    expect(errorAlAbrir(h("10:00", "02"), [{ inicio: h("16:00"), fin: null }], ahora)).toContain("en curso");
  });

  it("el inicio no puede ser futuro", () => {
    expect(errorAlAbrir(h("18:00", "05"), [], ahora)).toContain("futura");
  });
});

describe("solapamiento de una bomba", () => {
  const deLaBomba = [
    { id: 1, inicio: h("10:00"), fin: h("12:00") },
    { id: 2, inicio: h("16:00"), fin: null },
  ];

  it("detecta solapes con tramos cerrados y abiertos", () => {
    expect(tramoSolapado({ inicio: h("11:00"), fin: null }, deLaBomba)?.id).toBe(1);
    expect(tramoSolapado({ inicio: h("09:00"), fin: h("10:30") }, deLaBomba)?.id).toBe(1);
    expect(tramoSolapado({ inicio: h("20:00"), fin: null }, deLaBomba)?.id).toBe(2);
  });

  it("tramos contiguos no se solapan", () => {
    expect(tramoSolapado({ inicio: h("12:00"), fin: h("16:00") }, deLaBomba)).toBeUndefined();
  });
});
