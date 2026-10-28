const ESTILO = {
  EN_CURSO: { texto: "En curso", clase: "bg-green-100 text-green-800" },
  PAUSADA: { texto: "Pausada", clase: "bg-amber-100 text-amber-900" },
  FINALIZADA: { texto: "Finalizada", clase: "bg-slate-200 text-slate-700" },
} as const;

export function EtiquetaEstado({ estado }: { estado: keyof typeof ESTILO }) {
  const { texto, clase } = ESTILO[estado];
  return <span className={`rounded-full px-3 py-1 text-sm font-semibold ${clase}`}>{texto}</span>;
}

export function EtiquetaTipo({ tipo }: { tipo: "DESCARGA" | "CARGA" }) {
  return (
    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">
      {tipo === "CARGA" ? "Carga" : "Descarga"}
    </span>
  );
}
