// Filtros del Historial (sección 6.6), leídos de la dirección de la página.

export type Filtros = {
  desde: string | null;
  hasta: string | null;
  texto: string | null;
  estado: "EN_CURSO" | "PAUSADA" | "FINALIZADA" | null;
  tipo: "DESCARGA" | "CARGA" | null;
  productoId: number | null;
  proveedorId: number | null;
  bombaId: number | null;
  tanqueId: number | null;
  pagina: number;
};

type Parametros = Record<string, string | string[] | undefined>;

const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || null;
const dia = (v: string | null) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
const idPositivo = (v: string | null) => (v && /^\d+$/.test(v) && Number(v) > 0 ? Number(v) : null);

export function leerFiltros(p: Parametros): Filtros {
  const estado = uno(p.estado);
  const tipo = uno(p.tipo);
  const texto = uno(p.texto)?.toUpperCase().replace(/[^A-Z0-9]/g, "") || null;
  return {
    desde: dia(uno(p.desde)),
    hasta: dia(uno(p.hasta)),
    texto,
    estado: estado === "EN_CURSO" || estado === "PAUSADA" || estado === "FINALIZADA" ? estado : null,
    tipo: tipo === "DESCARGA" || tipo === "CARGA" ? tipo : null,
    productoId: idPositivo(uno(p.productoId)),
    proveedorId: idPositivo(uno(p.proveedorId)),
    bombaId: idPositivo(uno(p.bombaId)),
    tanqueId: idPositivo(uno(p.tanqueId)),
    pagina: idPositivo(uno(p.pagina)) ?? 1,
  };
}

/** Dirección del Historial con los mismos filtros y otra página. */
export function enlaceDePagina(filtros: Filtros, pagina: number): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filtros)) if (k !== "pagina" && v !== null) p.set(k, String(v));
  if (pagina > 1) p.set("pagina", String(pagina));
  const q = p.toString();
  return `/colaborador/historial${q ? `?${q}` : ""}`;
}
