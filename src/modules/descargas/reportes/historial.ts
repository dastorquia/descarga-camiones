import { etiquetaBomba } from "@/shared/catalogos/sector";
import { formatearFechaHora } from "@/shared/lib/fechas";
import { horasBomba } from "../dominio/horas";
import { aKilosDesdeBase } from "../dominio/toneladas";
import type { Tabla } from "./tabla";

type DescargaHistorial = {
  hojaDeRuta: string;
  tipo: "DESCARGA" | "CARGA";
  estado: "EN_CURSO" | "PAUSADA" | "FINALIZADA";
  patente: string | null;
  producto: { nombre: string };
  proveedor: { nombre: string };
  tanque: { codigo: string };
  toneladas: { toString(): string } | null;
  observaciones: string | null;
  tramos: { inicio: Date; fin: Date | null; bomba: { codigo: string; descripcion: string | null } }[];
};

const TIPO = { DESCARGA: "Descarga", CARGA: "Carga" } as const;
const ESTADO = { EN_CURSO: "En curso", PAUSADA: "Pausada", FINALIZADA: "Finalizada" } as const;

/** Historial como tabla de reporte, para la pantalla y la exportación a Excel o CSV. */
export function tablaHistorial(descargas: DescargaHistorial[]): Tabla {
  return {
    id: "historial",
    titulo: "Historial de descargas y cargas",
    hoja: "Historial",
    columnas: [
      { titulo: "Hoja de ruta", tipo: "texto" },
      { titulo: "Tipo", tipo: "texto" },
      { titulo: "Estado", tipo: "texto" },
      { titulo: "Patente", tipo: "texto" },
      { titulo: "Inicio", tipo: "texto" },
      { titulo: "Fin", tipo: "texto" },
      { titulo: "Producto", tipo: "texto" },
      { titulo: "Proveedor o cliente", tipo: "texto" },
      { titulo: "Tanque", tipo: "texto" },
      { titulo: "Bombas", tipo: "texto" },
      { titulo: "Horas de bomba", tipo: "horas" },
      { titulo: "Kilos", tipo: "kilos" },
      { titulo: "Observaciones", tipo: "texto" },
    ],
    filas: descargas.map((d) => {
      const inicio = d.tramos[0]?.inicio;
      // El fin es el del último tramo, solo si no queda ninguno abierto.
      const ultimo = d.tramos.at(-1);
      const fin = ultimo?.fin && d.tramos.every((t) => t.fin) ? ultimo.fin : null;
      return [
        d.hojaDeRuta,
        TIPO[d.tipo],
        ESTADO[d.estado],
        d.patente,
        inicio ? formatearFechaHora(inicio) : null,
        fin ? formatearFechaHora(fin) : null,
        d.producto.nombre,
        d.proveedor.nombre,
        d.tanque.codigo,
        [...new Set(d.tramos.map((t) => etiquetaBomba(t.bomba.codigo, t.bomba.descripcion)))].join(", "),
        horasBomba(d.tramos),
        d.toneladas === null ? null : aKilosDesdeBase(d.toneladas),
        d.observaciones,
      ];
    }),
  };
}
