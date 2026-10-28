import "server-only";
import { catalogosActivos } from "@/shared/catalogos/datos";
import { etiquetaBomba } from "@/shared/catalogos/sector";
import { leerUmbrales } from "@/shared/config/leer";
import { db } from "@/shared/lib/db";
import { aDiaHora, desdeDiaHora } from "@/shared/lib/fechas";
import { descargasActivas, descargasFinalizadasHoy } from "../datos";
import { horasBomba } from "../dominio/horas";
import { horasPorBombaPorDia, toneladasPorBomba } from "../dominio/reportes";
import { estadoBombas } from "../dominio/tablero";
import { cargarDescargasReporte, finalizadasEnRango } from "../reportes/datos";
import type { DatosTablero, TarjetaTablero } from "./tipos";

/** Del día 1 del mes en curso (Argentina) al día 1 del mes siguiente. */
function rangoDelMes(ahora: Date) {
  const [anio, mes] = aDiaHora(ahora).dia.split("-").map(Number) as [number, number];
  const siguiente = mes === 12 ? `${anio + 1}-01-01` : `${anio}-${String(mes + 1).padStart(2, "0")}-01`;
  return { desde: desdeDiaHora(`${anio}-${String(mes).padStart(2, "0")}-01`, "00:00")!, hasta: desdeDiaHora(siguiente, "00:00")! };
}

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
function nombreDelMes(ahora: Date): string {
  const [anio, mes] = aDiaHora(ahora).dia.split("-").map(Number) as [number, number];
  return `${MESES[mes - 1]} ${anio}`;
}

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
  const ahora = new Date();
  const mes = rangoDelMes(ahora);
  const [activas, finalizadas, catalogos, umbrales, abiertos, mantenimientos, delMes] = await Promise.all([
    descargasActivas(),
    descargasFinalizadasHoy(),
    catalogosActivos(),
    leerUmbrales(),
    db.tramoBombeo.findMany({
      where: { fin: null },
      select: { bombaId: true, inicio: true, descarga: { select: { id: true, hojaDeRuta: true } } },
    }),
    db.mantenimientoBomba.findMany({ where: { hasta: null }, select: { bombaId: true, desde: true, motivo: true } }),
    cargarDescargasReporte(mes),
  ]);

  // Gráficos del mes en curso: mismos cálculos que los reportes.
  const horas = new Map<number, number>();
  for (const h of horasPorBombaPorDia(delMes, mes)) horas.set(h.bombaId, (horas.get(h.bombaId) ?? 0) + h.horas);
  const kilos = toneladasPorBomba(finalizadasEnRango(delMes, mes).map((x) => x.d));
  const kilosDe = (bombaId: number, tipo: "DESCARGA" | "CARGA") => kilos.find((k) => k.bombaId === bombaId && k.tipo === tipo)?.kilos ?? 0;

  // Más antiguas primero: son las que más pueden necesitar atención.
  const porInicio = (a: TarjetaTablero, b: TarjetaTablero) =>
    (a.tramoAbiertoDesde ?? "").localeCompare(b.tramoAbiertoDesde ?? "");

  return {
    generado: ahora.toISOString(),
    horasAlerta: umbrales.horasAlertaTramoAbierto,
    pendientes: activas.filter((d) => d.estado === "PAUSADA").map(tarjeta),
    enCurso: activas.filter((d) => d.estado === "EN_CURSO").map(tarjeta).sort(porInicio),
    finalizadas: finalizadas.map(tarjeta),
    bombas: estadoBombas(catalogos.bombas, abiertos, mantenimientos).map((b) => ({
      id: b.id,
      etiqueta: etiquetaBomba(b.codigo, b.sector),
      sector: b.sector,
      ocupadaPor: b.ocupadaPor && { ...b.ocupadaPor, desde: b.ocupadaPor.desde.toISOString() },
      mantenimiento: b.mantenimiento && { ...b.mantenimiento, desde: b.mantenimiento.desde.toISOString() },
    })),
    graficos: {
      mes: nombreDelMes(ahora),
      bombas: catalogos.bombas.map((b) => ({
        id: b.id,
        etiqueta: etiquetaBomba(b.codigo, b.sector),
        kilosDescarga: kilosDe(b.id, "DESCARGA"),
        kilosCarga: kilosDe(b.id, "CARGA"),
        horas: horas.get(b.id) ?? 0,
      })),
    },
  };
}
