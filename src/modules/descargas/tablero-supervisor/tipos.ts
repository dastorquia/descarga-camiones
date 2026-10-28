// Datos del tablero del Supervisor, listos para enviar al navegador
// (fechas como texto ISO, toneladas como texto).

export type TarjetaTablero = {
  id: number;
  hojaDeRuta: string;
  tipo: "DESCARGA" | "CARGA";
  producto: string;
  proveedor: string;
  tanque: string;
  /** Bomba del último tramo, como "D1-BCI010". */
  bomba: string | null;
  tramoAbiertoDesde: string | null;
  pausadaDesde: string | null;
  finalizadaA: string | null;
  toneladas: string | null;
  horasBomba: number;
};

export type BombaTablero = {
  id: number;
  etiqueta: string;
  sector: string | null;
  ocupadaPor: { descargaId: number; hojaDeRuta: string; desde: string } | null;
  mantenimiento: { desde: string; motivo: string | null } | null;
};

/** Totales del mes en curso por bomba, para los gráficos (se reinician cada mes). */
export type GraficosMes = {
  /** "Octubre 2026" */
  mes: string;
  bombas: { id: number; etiqueta: string; kilosDescarga: number; kilosCarga: number; horas: number }[];
};

export type DatosTablero = {
  generado: string;
  horasAlerta: number;
  pendientes: TarjetaTablero[];
  enCurso: TarjetaTablero[];
  finalizadas: TarjetaTablero[];
  bombas: BombaTablero[];
  graficos: GraficosMes;
};
