import "server-only";
import { etiquetaBomba } from "@/shared/catalogos/sector";
import { db } from "@/shared/lib/db";
import { desdeDiaHora, formatearFechaHora } from "@/shared/lib/fechas";
import {
  horasPorBombaPorDia,
  horasPorBombaPorMes,
  resumenDescarga,
  toneladasPor,
  toneladasPorBomba,
  type DescargaReporte,
  type Rango,
} from "../dominio/reportes";
import { aKilosDesdeBase } from "../dominio/toneladas";
import { intervalosMovimientos } from "@/modules/movimientos/datos";
import type { FiltrosReporte } from "./filtros";
import type { Tabla } from "./tabla";

const TIPO = { DESCARGA: "Descarga", CARGA: "Carga" } as const;
const mesLegible = (mes: string) => `${mes.slice(5, 7)}/${mes.slice(0, 4)}`;
const diaLegible = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}/${dia.slice(0, 4)}`;

/** Descargas con algún bombeo que toque el período, listas para los cálculos de reportes. */
export async function cargarDescargasReporte(rango: Rango, tipo: "DESCARGA" | "CARGA" | null = null): Promise<DescargaReporte[]> {
  const filas = await db.descarga.findMany({
    where: {
      ...(tipo ? { tipo } : {}),
      tramos: { some: { inicio: { lt: rango.hasta }, OR: [{ fin: null }, { fin: { gt: rango.desde } }] } },
    },
    include: { tramos: { orderBy: { inicio: "asc" } } },
  });
  return filas.map((d) => ({
    id: d.id,
    hojaDeRuta: d.hojaDeRuta,
    tipo: d.tipo,
    estado: d.estado,
    productoId: d.productoId,
    proveedorId: d.proveedorId,
    tanqueId: d.tanqueId,
    toneladas: d.toneladas?.toString() ?? null,
    tramos: d.tramos.map((t) => ({ bombaId: t.bombaId, inicio: t.inicio, fin: t.fin, toneladas: t.toneladas?.toString() ?? null })),
  }));
}

/** Descargas finalizadas cuyo último tramo terminó dentro del período (ahí se atribuyen sus kilos). */
export function finalizadasEnRango(descargas: readonly DescargaReporte[], rango: Rango) {
  return descargas
    .map((d) => ({ d, r: resumenDescarga(d) }))
    .filter(({ d, r }) => d.estado === "FINALIZADA" && r.fin && r.fin >= rango.desde && r.fin < rango.hasta)
    .sort((a, b) => a.r.fin!.getTime() - b.r.fin!.getTime());
}

/** Todos los reportes de la sección 7 para el período y tipo elegidos. */
export async function armarReportes(f: FiltrosReporte): Promise<Tabla[]> {
  const desde = desdeDiaHora(f.desde, "00:00")!;
  const hasta = new Date(desdeDiaHora(f.hasta, "00:00")!.getTime() + 24 * 3_600_000);
  const rango = { desde, hasta };

  const [descargas, bombas, productos, proveedores, tanques] = await Promise.all([
    cargarDescargasReporte(rango, f.tipo),
    db.bomba.findMany(),
    db.producto.findMany(),
    db.proveedor.findMany(),
    db.tanque.findMany(),
  ]);

  const nombreBomba = Object.fromEntries(bombas.map((b) => [b.id, etiquetaBomba(b.codigo, b.descripcion)]));
  const nombre = {
    productoId: Object.fromEntries(productos.map((x) => [x.id, x.nombre])),
    proveedorId: Object.fromEntries(proveedores.map((x) => [x.id, x.nombre])),
    tanqueId: Object.fromEntries(tanques.map((x) => [x.id, x.codigo])),
  };

  // Los kilos se atribuyen al día en que terminó la descarga.
  const finalizadas = finalizadasEnRango(descargas, rango);
  const soloFinalizadas = finalizadas.map((x) => x.d);

  // Las horas de bomba incluyen los movimientos internos (sección 13).
  const porDia = horasPorBombaPorDia(descargas, rango, await intervalosMovimientos(rango));
  const porMes = horasPorBombaPorMes(porDia);

  const porClave = (campo: keyof typeof nombre, titulo: string, id: string): Tabla => ({
    id,
    hoja: `Por ${titulo.toLowerCase()}`,
    titulo: `Kilos por ${titulo.toLowerCase()}`,
    columnas: [
      { titulo, tipo: "texto" },
      { titulo: "Descarga", tipo: "kilos" },
      { titulo: "Carga", tipo: "kilos" },
      { titulo: "Total", tipo: "kilos" },
    ],
    filas: toneladasPor(campo, soloFinalizadas).map((t) => [
      nombre[campo][t.id] ?? `#${t.id}`,
      t.descarga,
      t.carga,
      t.descarga + t.carga,
    ]),
  });

  return [
    {
      id: "horas-bomba-mes",
      hoja: "Horas por bomba y mes",
      titulo: "Horas de funcionamiento por bomba y mes",
      descripcion: "Solo tramos cerrados. Los tramos que cruzan la medianoche se reparten entre los días.",
      columnas: [
        { titulo: "Mes", tipo: "texto" },
        { titulo: "Bomba", tipo: "texto" },
        { titulo: "Horas", tipo: "horas" },
      ],
      filas: porMes.map((h) => [mesLegible(h.mes), nombreBomba[h.bombaId] ?? `#${h.bombaId}`, h.horas]),
    },
    {
      id: "horas-bomba-dia",
      hoja: "Horas por bomba y día",
      titulo: "Horas de funcionamiento por bomba y día",
      columnas: [
        { titulo: "Día", tipo: "texto" },
        { titulo: "Bomba", tipo: "texto" },
        { titulo: "Horas", tipo: "horas" },
      ],
      filas: porDia.map((h) => [diaLegible(h.dia), nombreBomba[h.bombaId] ?? `#${h.bombaId}`, h.horas]),
    },
    {
      id: "descargas",
      hoja: "Por descarga",
      titulo: "Rendimiento y tiempos por descarga",
      descripcion:
        "Finalizadas en el período. Rendimiento = kilos ÷ horas de bombeo (kg/h). Pausas = tiempo total − tiempo de bombeo. Con varias bombas, el rendimiento es de la descarga completa.",
      columnas: [
        { titulo: "Hoja de ruta", tipo: "texto" },
        { titulo: "Tipo", tipo: "texto" },
        { titulo: "Terminó", tipo: "texto" },
        { titulo: "Producto", tipo: "texto" },
        { titulo: "Proveedor o cliente", tipo: "texto" },
        { titulo: "Tanque", tipo: "texto" },
        { titulo: "Bombas", tipo: "texto" },
        { titulo: "Kilos", tipo: "kilos" },
        { titulo: "Bombeo", tipo: "horas" },
        { titulo: "Rendimiento", tipo: "rendimiento" },
        { titulo: "Tiempo total", tipo: "horas" },
        { titulo: "Pausas", tipo: "horas" },
      ],
      filas: finalizadas.map(({ d, r }) => [
        d.hojaDeRuta,
        TIPO[d.tipo],
        formatearFechaHora(r.fin!),
        nombre.productoId[d.productoId] ?? "",
        nombre.proveedorId[d.proveedorId] ?? "",
        nombre.tanqueId[d.tanqueId] ?? "",
        [...new Set(d.tramos.map((t) => nombreBomba[t.bombaId]))].join(", "),
        d.toneladas ? aKilosDesdeBase(d.toneladas) : null,
        r.horasBombeo,
        r.rendimiento,
        r.horasTotales,
        r.horasPausa,
      ]),
    },
    {
      id: "bombas",
      hoja: "Por bomba",
      titulo: "Kilos y rendimiento por bomba",
      descripcion:
        "Separado por tipo de operación. Con una sola bomba es exacto. Con varias bombas solo cuentan los tramos con kilos asignados por el Supervisor (asignación manual).",
      columnas: [
        { titulo: "Tipo", tipo: "texto" },
        { titulo: "Bomba", tipo: "texto" },
        { titulo: "Descargas", tipo: "entero" },
        { titulo: "Kilos", tipo: "kilos" },
        { titulo: "Horas", tipo: "horas" },
        { titulo: "Rendimiento", tipo: "rendimiento" },
        { titulo: "Incluye asignación manual", tipo: "texto" },
      ],
      filas: toneladasPorBomba(soloFinalizadas).map((b) => [
        TIPO[b.tipo],
        nombreBomba[b.bombaId] ?? `#${b.bombaId}`,
        b.descargas,
        b.kilos,
        b.horas,
        b.rendimiento,
        b.asignacionManual ? "Sí" : "No",
      ]),
    },
    porClave("productoId", "Producto", "productos"),
    porClave("proveedorId", "Proveedor o cliente", "proveedores"),
    porClave("tanqueId", "Tanque", "tanques"),
  ];
}
