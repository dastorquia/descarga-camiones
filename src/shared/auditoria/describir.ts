import { aKilosDesdeBase } from "@/modules/descargas/dominio/toneladas";
import { formatearFechaHora } from "@/shared/lib/fechas";

// Traduce los valores guardados en AuditLog (antes / después) a texto legible.

export type Cambio = { campo: string; antes: string; despues: string };

/** Nombres por id para los campos que guardan ids: { productoId: { 4: "Aceite" }, ... } */
export type Nombres = Partial<Record<"productoId" | "proveedorId" | "tanqueId" | "bombaId" | "operarioId", Record<number, string>>>;

const ETIQUETAS: Record<string, string> = {
  tipo: "Tipo",
  hojaDeRuta: "Hoja de ruta",
  patente: "Patente",
  productoId: "Producto",
  proveedorId: "Proveedor o cliente",
  tanqueId: "Tanque",
  observaciones: "Observaciones",
  estado: "Estado",
  bombaId: "Bomba",
  operarioId: "Operario",
  inicio: "Inicio",
  fin: "Fin",
  toneladas: "Kilos",
  tramos: "Kilos por tramo",
  valor: "Nombre o código",
  sector: "Sector",
  activo: "Activo",
  enMantenimiento: "En mantenimiento",
  mantenimientoAutonomo: "Mantenimiento autónomo",
  tarea: "Tarea",
  fecha: "Día y hora",
  motivo: "Motivo",
  pinCambiado: "PIN cambiado",
  pinPorDefecto: "PIN por defecto",
  toneladasMin: "Kilos mínimos",
  toneladasMax: "Kilos máximos",
  kilosMin: "Kilos mínimos",
  kilosMax: "Kilos máximos",
  horasAlertaTramoAbierto: "Horas de alerta",
};

const TEXTOS: Record<string, string> = {
  DESCARGA: "Descarga",
  CARGA: "Carga",
  EN_CURSO: "En curso",
  PAUSADA: "Pausada",
  FINALIZADA: "Finalizada",
};

/** Campos internos que no se muestran como cambio. */
const OCULTOS = new Set(["descargaId"]);

const ES_FECHA_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/** Las cantidades se guardan en toneladas con 3 decimales; se muestran en kilos. */
function comoKilos(v: unknown): string {
  return v === null || v === undefined ? "—" : `${aKilosDesdeBase(String(v)).toLocaleString("es-AR")} kg`;
}

function formatear(campo: string, valor: unknown, nombres: Nombres): string {
  if (valor === null || valor === undefined || valor === "") return "—";
  if (campo in nombres && typeof valor === "number") return nombres[campo as keyof Nombres]?.[valor] ?? `#${valor}`;
  if (campo === "toneladas") return comoKilos(valor);
  if (campo === "tramos" && Array.isArray(valor)) {
    return valor.map((t: { id?: number; toneladas?: unknown }) => `tramo #${t.id}: ${comoKilos(t.toneladas)}`).join("; ");
  }
  if ((campo === "kilosMin" || campo === "kilosMax") && typeof valor === "number") return `${valor.toLocaleString("es-AR")} kg`;
  if ((campo === "toneladasMin" || campo === "toneladasMax") && typeof valor === "number") return `${(valor * 1000).toLocaleString("es-AR")} kg`;
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  if (typeof valor === "number") return valor.toLocaleString("es-AR");
  if (typeof valor === "string") {
    if (ES_FECHA_ISO.test(valor)) return formatearFechaHora(new Date(valor));
    return TEXTOS[valor] ?? valor;
  }
  return JSON.stringify(valor);
}

const comoObjeto = (v: unknown): Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

export function describirCambios(antes: unknown, despues: unknown, nombres: Nombres = {}): Cambio[] {
  const a = comoObjeto(antes);
  const d = comoObjeto(despues);
  // La base no conserva el orden de los campos: se ordenan como en ETIQUETAS.
  const orden = Object.keys(ETIQUETAS);
  const posicion = (c: string) => (orden.includes(c) ? orden.indexOf(c) : orden.length);
  const campos = [...new Set([...Object.keys(a), ...Object.keys(d)])]
    .filter((c) => !OCULTOS.has(c))
    .sort((x, y) => posicion(x) - posicion(y));
  return campos
    .map((c) => ({ campo: ETIQUETAS[c] ?? c, antes: formatear(c, a[c], nombres), despues: formatear(c, d[c], nombres) }))
    .filter((c) => !(c.antes === "—" && c.despues === "—"));
}

export const NOMBRE_ACCION: Record<string, string> = {
  CREAR: "Alta",
  EDITAR: "Edición",
  DESACTIVAR: "Desactivación",
  REACTIVAR: "Reactivación",
  ELIMINAR: "Eliminación",
};

export const NOMBRE_ENTIDAD: Record<string, string> = {
  Descarga: "Descarga",
  TramoBombeo: "Tramo",
  Bomba: "Bomba",
  Tanque: "Tanque",
  Producto: "Producto",
  Proveedor: "Proveedor o cliente",
  Operario: "Operario",
  MovimientoInterno: "Movimiento interno",
  TareaAutonoma: "Mantenimiento autónomo",
  "Config.umbrales": "Umbrales",
  "Config.pinSupervisor": "PIN del Supervisor",
};
