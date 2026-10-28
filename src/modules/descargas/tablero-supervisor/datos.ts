import "server-only";
import { catalogosActivos } from "@/shared/catalogos/datos";
import { etiquetaBomba } from "@/shared/catalogos/sector";
import { leerUmbrales } from "@/shared/config/leer";
import { db } from "@/shared/lib/db";
import { descargasActivas, descargasFinalizadasHoy } from "../datos";
import { horasBomba } from "../dominio/horas";
import { estadoBombas } from "../dominio/tablero";
import type { DatosTablero, TarjetaTablero } from "./tipos";

type ConDetalle = Awaited<ReturnType<typeof descargasActivas>>[number];

function tarjeta(d: ConDetalle): TarjetaTablero {
  const ultimo = d.tramos.at(-1);
  const abierto = d.tramos.find((t) => t.fin === null);
  return {
    id: d.id,
    hojaDeRuta: d.hojaDeRuta,
    tipo: d.tipo,
    producto: d.producto.nombre,
    proveedor: d.proveedor.nombre,
    tanque: d.tanque.codigo,
    bomba: ultimo ? etiquetaBomba(ultimo.bomba.codigo, ultimo.bomba.descripcion) : null,
    tramoAbiertoDesde: abierto?.inicio.toISOString() ?? null,
    pausadaDesde: d.estado === "PAUSADA" ? (ultimo?.fin?.toISOString() ?? null) : null,
    finalizadaA: d.estado === "FINALIZADA" ? (ultimo?.fin?.toISOString() ?? null) : null,
    toneladas: d.toneladas?.toString() ?? null,
    horasBomba: horasBomba(d.tramos),
  };
}

/** Todo lo que muestra el tablero del Supervisor (sección 6.5). */
export async function datosTablero(): Promise<DatosTablero> {
  const [activas, finalizadas, catalogos, umbrales, abiertos, tanques] = await Promise.all([
    descargasActivas(),
    descargasFinalizadasHoy(),
    catalogosActivos(),
    leerUmbrales(),
    db.tramoBombeo.findMany({
      where: { fin: null },
      select: { bombaId: true, inicio: true, descarga: { select: { id: true, hojaDeRuta: true } } },
    }),
    db.tanque.findMany({ where: { activo: true }, orderBy: { codigo: "asc" }, select: { id: true, codigo: true } }),
  ]);

  // Más antiguas primero: son las que más pueden necesitar atención.
  const porInicio = (a: TarjetaTablero, b: TarjetaTablero) =>
    (a.tramoAbiertoDesde ?? "").localeCompare(b.tramoAbiertoDesde ?? "");

  return {
    generado: new Date().toISOString(),
    horasAlerta: umbrales.horasAlertaTramoAbierto,
    pendientes: activas.filter((d) => d.estado === "PAUSADA").map(tarjeta),
    enCurso: activas.filter((d) => d.estado === "EN_CURSO").map(tarjeta).sort(porInicio),
    finalizadas: finalizadas.map(tarjeta),
    bombas: estadoBombas(catalogos.bombas, abiertos).map((b) => ({
      id: b.id,
      etiqueta: etiquetaBomba(b.codigo, b.sector),
      sector: b.sector,
      ocupadaPor: b.ocupadaPor && { ...b.ocupadaPor, desde: b.ocupadaPor.desde.toISOString() },
    })),
    tanques: tanques.map((t) => ({
      ...t,
      descargas: activas
        .filter((d) => d.tanqueId === t.id)
        .map((d) => ({ id: d.id, hojaDeRuta: d.hojaDeRuta, estado: d.estado as "EN_CURSO" | "PAUSADA" })),
    })),
  };
}
