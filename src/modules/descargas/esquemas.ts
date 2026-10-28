import { z } from "zod";

// Esquemas de los formularios. Validan forma y tipos; las reglas de negocio
// (horarios, solapes, estados) se verifican en el servidor con dominio/reglas.ts.

const id = (mensaje: string) => z.coerce.number({ error: mensaje }).int().positive(mensaje);
const dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Elegí el día.");
const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Elegí la hora.");

export const esquemaNuevaDescarga = z.object({
  tipo: z.enum(["DESCARGA", "CARGA"], { error: "Elegí si es descarga o carga." }),
  hojaDeRuta: z.string(),
  patente: z.string().default(""),
  productoId: id("Elegí el producto."),
  proveedorId: id("Elegí el proveedor o cliente."),
  tanqueId: id("Elegí el tanque."),
  bombaId: id("Elegí la bomba."),
  operarioId: id("Elegí el operario."),
  dia,
  hora,
  observaciones: z.string().max(500, "Las observaciones son demasiado largas.").default(""),
});

export const esquemaCerrarTramo = z.object({
  descargaId: id("Descarga inválida."),
  dia,
  hora,
});

export const esquemaReanudar = z.object({
  descargaId: id("Descarga inválida."),
  bombaId: id("Elegí la bomba."),
  operarioId: id("Elegí el operario."),
  dia,
  hora,
});

export const esquemaEditarDatos = esquemaNuevaDescarga
  .omit({ bombaId: true, operarioId: true, dia: true, hora: true })
  .extend({ descargaId: id("Descarga inválida.") });

export const esquemaEditarTramo = z.object({
  descargaId: id("Descarga inválida."),
  tramoId: id("Tramo inválido."),
  bombaId: id("Elegí la bomba."),
  operarioId: id("Elegí el operario."),
  inicioDia: dia,
  inicioHora: hora,
  // Vacíos si el tramo sigue en curso.
  finDia: z.union([dia, z.literal("")]).default(""),
  finHora: z.union([hora, z.literal("")]).default(""),
});

/** Tramo agregado a mano: siempre cerrado (para abrir uno nuevo está "Reanudar"). */
export const esquemaAgregarTramo = z.object({
  descargaId: id("Descarga inválida."),
  bombaId: id("Elegí la bomba."),
  operarioId: id("Elegí el operario."),
  inicioDia: dia,
  inicioHora: hora,
  finDia: dia,
  finHora: hora,
});

export const esquemaFinalizar = z.object({
  descargaId: id("Descarga inválida."),
  // Vacíos cuando la descarga ya estaba pausada (no hay tramo para cerrar).
  dia: z.union([dia, z.literal("")]),
  hora: z.union([hora, z.literal("")]),
  kilos: z.string(),
  confirmado: z.string().optional(),
});
