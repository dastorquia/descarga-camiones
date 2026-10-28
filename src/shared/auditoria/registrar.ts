import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { Perfil } from "@/shared/auth/perfiles";

export type AccionAuditoria = "CREAR" | "EDITAR" | "DESACTIVAR" | "REACTIVAR" | "ELIMINAR";

type Entrada = {
  perfil: Perfil;
  entidad: string;
  entidadId: number;
  accion: AccionAuditoria;
  antes?: Prisma.InputJsonValue;
  despues?: Prisma.InputJsonValue;
};

/** Registra en AuditLog dentro de la misma transacción que el cambio. */
export async function registrarAuditoria(tx: Prisma.TransactionClient, entrada: Entrada) {
  await tx.auditLog.create({ data: entrada });
}
