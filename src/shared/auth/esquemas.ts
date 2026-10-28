import { z } from "zod";

export const esquemaPin = z
  .string()
  .regex(/^\d{4,8}$/, "El PIN tiene que tener entre 4 y 8 números.");

export const esquemaCambioPin = z
  .object({
    actual: z.string().min(1, "Escribí el PIN actual."),
    nuevo: esquemaPin,
    repetido: z.string(),
  })
  .refine((datos) => datos.nuevo === datos.repetido, {
    message: "El PIN nuevo y su repetición no coinciden.",
    path: ["repetido"],
  });
