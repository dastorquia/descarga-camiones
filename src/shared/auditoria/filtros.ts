// Filtros de la pantalla de auditoría, leídos de la dirección de la página.

export const GRUPOS = {
  descargas: { texto: "Descargas y tramos", entidades: ["Descarga", "TramoBombeo"] },
  catalogos: { texto: "Catálogos", entidades: ["Bomba", "Tanque", "Producto", "Proveedor", "Operario"] },
  configuracion: { texto: "Configuración y PIN", entidades: ["Config.umbrales", "Config.pinSupervisor"] },
} as const;

export type Grupo = keyof typeof GRUPOS;

export const ACCIONES = ["CREAR", "EDITAR", "DESACTIVAR", "REACTIVAR", "ELIMINAR"] as const;

export type FiltrosAuditoria = {
  grupo: Grupo | null;
  accion: (typeof ACCIONES)[number] | null;
  desde: string | null;
  hasta: string | null;
  descargaId: number | null;
  pagina: number;
};

type Parametros = Record<string, string | string[] | undefined>;
const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || null;
const dia = (v: string | null) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
const positivo = (v: string | null) => (v && /^\d+$/.test(v) && Number(v) > 0 ? Number(v) : null);

export function leerFiltrosAuditoria(p: Parametros): FiltrosAuditoria {
  const grupo = uno(p.grupo);
  const accion = uno(p.accion);
  return {
    grupo: grupo && Object.hasOwn(GRUPOS, grupo) ? (grupo as Grupo) : null,
    accion: (ACCIONES as readonly string[]).includes(accion ?? "") ? (accion as FiltrosAuditoria["accion"]) : null,
    desde: dia(uno(p.desde)),
    hasta: dia(uno(p.hasta)),
    descargaId: positivo(uno(p.descargaId)),
    pagina: positivo(uno(p.pagina)) ?? 1,
  };
}

export function enlaceAuditoria(f: FiltrosAuditoria, pagina: number): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (k !== "pagina" && v !== null) p.set(k, String(v));
  if (pagina > 1) p.set("pagina", String(pagina));
  const q = p.toString();
  return `/supervisor/auditoria${q ? `?${q}` : ""}`;
}
