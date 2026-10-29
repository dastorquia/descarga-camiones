import "dotenv/config";
import { afterAll, describe, expect, it } from "vitest";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/shared/lib/db";
import { desdeDiaHora } from "@/shared/lib/fechas";

// Pruebas contra la base real (npm run test:integracion). Cada prueba corre dentro
// de una transacción que se deshace al final: no deja datos.

const DESHACER = new Error("deshacer");
const ar = (dia: string, hora: string) => desdeDiaHora(dia, hora)!;

type Ayudas = {
  tx: Prisma.TransactionClient;
  descarga: (hoja: string) => Promise<{ id: number }>;
  tramo: (descargaId: number, bombaId: number, inicio: Date, fin: Date | null) => Promise<unknown>;
  bomba1: number;
  bomba2: number;
};

/** Corre `prueba` en una transacción que siempre se deshace; devuelve el error, si hubo. */
async function enTransaccion(prueba: (a: Ayudas) => Promise<void>): Promise<unknown> {
  try {
    await db.$transaction(async (tx) => {
      // Bombas propias de la prueba: así no chocan con tramos reales (se deshacen al final).
      const [producto, proveedor, tanque, operario, ...bombas] = await Promise.all([
        tx.producto.findFirstOrThrow(),
        tx.proveedor.findFirstOrThrow(),
        tx.tanque.findFirstOrThrow(),
        tx.operario.findFirstOrThrow(),
        tx.bomba.create({ data: { codigo: "ZZPRUEBA1" } }),
        tx.bomba.create({ data: { codigo: "ZZPRUEBA2" } }),
      ]);
      await prueba({
        tx,
        bomba1: bombas[0]!.id,
        bomba2: bombas[1]!.id,
        descarga: (hojaDeRuta) =>
          tx.descarga.create({ data: { hojaDeRuta, patente: "AA000AA", productoId: producto.id, proveedorId: proveedor.id, tanqueId: tanque.id } }),
        tramo: (descargaId, bombaId, inicio, fin) => tx.tramoBombeo.create({ data: { descargaId, bombaId, operarioId: operario.id, inicio, fin } }),
      });
      throw DESHACER;
    });
  } catch (error) {
    return error === DESHACER ? null : error;
  }
  return null;
}

const restriccion = (error: unknown) => JSON.stringify((error as { meta?: unknown })?.meta ?? "");

const D1 = "2001-01-01";
const D2 = "2001-01-02";

describe("restricciones de la base", () => {
  it("acepta el caso de la sección 5 y la vista calcula 6,75 h", async () => {
    let fila: { horas_bombeo: unknown; horas_totales: unknown; horas_pausa: unknown; rendimiento_kg_h: unknown } | undefined;
    const error = await enTransaccion(async ({ tx, descarga, tramo, bomba1 }) => {
      const d = await descarga("INTEGRACION675");
      await tramo(d.id, bomba1, ar(D1, "16:00"), ar(D1, "19:30"));
      await tramo(d.id, bomba1, ar(D2, "06:00"), ar(D2, "09:15"));
      await tx.descarga.update({ where: { id: d.id }, data: { estado: "FINALIZADA", toneladas: "28.450" } });
      [fila] = await tx.$queryRaw`SELECT horas_bombeo, horas_totales, horas_pausa, rendimiento_kg_h FROM v_descargas_resumen WHERE descarga_id = ${d.id}`;
    });
    expect(error).toBeNull();
    expect(Number(fila?.horas_bombeo)).toBe(6.75);
    expect(Number(fila?.horas_totales)).toBe(17.25);
    expect(Number(fila?.horas_pausa)).toBe(10.5);
    expect(Number(fila?.rendimiento_kg_h)).toBe(4215);
  });

  it("rechaza tramos superpuestos de una misma bomba", async () => {
    const error = await enTransaccion(async ({ descarga, tramo, bomba1 }) => {
      const a = await descarga("INTEGRACIONA");
      const b = await descarga("INTEGRACIONB");
      await tramo(a.id, bomba1, ar(D1, "10:00"), ar(D1, "12:00"));
      await tramo(b.id, bomba1, ar(D1, "11:00"), ar(D1, "13:00"));
    });
    expect(restriccion(error)).toContain("TramoBombeo_bomba_sin_solape");
  });

  it("rechaza dos tramos abiertos en la misma bomba", async () => {
    const error = await enTransaccion(async ({ descarga, tramo, bomba1 }) => {
      const a = await descarga("INTEGRACIONA");
      const b = await descarga("INTEGRACIONB");
      await tramo(a.id, bomba1, ar(D1, "10:00"), null);
      await tramo(b.id, bomba1, ar(D2, "10:00"), null);
    });
    expect(restriccion(error)).toContain("TramoBombeo_bomba_sin_solape");
  });

  it("rechaza dos tramos abiertos en la misma descarga, aunque sean bombas distintas", async () => {
    const error = await enTransaccion(async ({ descarga, tramo, bomba1, bomba2 }) => {
      const a = await descarga("INTEGRACIONA");
      await tramo(a.id, bomba1, ar(D1, "10:00"), null);
      await tramo(a.id, bomba2, ar(D1, "11:00"), null);
    });
    expect(restriccion(error)).toContain("TramoBombeo_descarga_sin_solape");
  });

  it("acepta tramos contiguos (uno termina cuando empieza el otro)", async () => {
    const error = await enTransaccion(async ({ descarga, tramo, bomba1 }) => {
      const a = await descarga("INTEGRACIONA");
      const b = await descarga("INTEGRACIONB");
      await tramo(a.id, bomba1, ar(D1, "10:00"), ar(D1, "12:00"));
      await tramo(b.id, bomba1, ar(D1, "12:00"), ar(D1, "14:00"));
    });
    expect(error).toBeNull();
  });

  it("rechaza un fin anterior al inicio", async () => {
    const error = await enTransaccion(async ({ descarga, tramo, bomba1 }) => {
      const a = await descarga("INTEGRACIONA");
      await tramo(a.id, bomba1, ar(D1, "12:00"), ar(D1, "10:00"));
    });
    expect(restriccion(error)).toContain("TramoBombeo_fin_posterior_inicio");
  });

  it("rechaza dos mantenimientos abiertos de la misma bomba", async () => {
    const error = await enTransaccion(async ({ tx, bomba1 }) => {
      await tx.mantenimientoBomba.create({ data: { bombaId: bomba1 } });
      await tx.mantenimientoBomba.create({ data: { bombaId: bomba1 } });
    });
    expect(restriccion(error)).toContain("MantenimientoBomba_uno_abierto");
  });

  it("acepta un mantenimiento terminado y uno nuevo de la misma bomba", async () => {
    const error = await enTransaccion(async ({ tx, bomba1 }) => {
      await tx.mantenimientoBomba.create({ data: { bombaId: bomba1, desde: ar(D1, "08:00"), hasta: ar(D1, "10:00") } });
      await tx.mantenimientoBomba.create({ data: { bombaId: bomba1 } });
    });
    expect(error).toBeNull();
  });

  it("la vista resume en kilos y kg/h", async () => {
    let fila: { kilos: unknown; rendimiento_kg_h: unknown } | undefined;
    const error = await enTransaccion(async ({ tx, descarga, tramo, bomba1 }) => {
      const d = await descarga("INTEGRACIONKG");
      await tramo(d.id, bomba1, ar(D1, "10:00"), ar(D1, "14:00"));
      await tx.descarga.update({ where: { id: d.id }, data: { estado: "FINALIZADA", toneladas: "28.000" } });
      [fila] = await tx.$queryRaw`SELECT kilos, rendimiento_kg_h FROM v_descargas_resumen WHERE descarga_id = ${d.id}`;
    });
    expect(error).toBeNull();
    expect(Number(fila?.kilos)).toBe(28000);
    expect(Number(fila?.rendimiento_kg_h)).toBe(7000);
  });

  it("rechaza una hoja de ruta repetida", async () => {
    const error = await enTransaccion(async ({ descarga }) => {
      await descarga("INTEGRACIONA");
      await descarga("INTEGRACIONA");
    });
    expect(restriccion(error)).toContain("Descarga_hojaDeRuta_key");
  });
});

afterAll(async () => {
  await db.$disconnect();
});
