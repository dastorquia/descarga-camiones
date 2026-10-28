// Claves de la tabla Config y sus valores iniciales (sección 5 y 12 de la especificación).
export const CLAVES_CONFIG = {
  pinSupervisorHash: "pinSupervisorHash",
  pinPorDefecto: "pinPorDefecto",
  toneladasMin: "toneladasMin",
  toneladasMax: "toneladasMax",
  horasAlertaTramoAbierto: "horasAlertaTramoAbierto",
} as const;

export const PIN_INICIAL = "1234";

export const VALORES_INICIALES = {
  toneladasMin: "3",
  toneladasMax: "40",
  horasAlertaTramoAbierto: "12",
} as const;
