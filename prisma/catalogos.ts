// Catálogos reales de planta, confirmados por el usuario el 28/10/2026.

export const PRODUCTOS = [
  "Borra",
  "Borra de neutralización",
  "Borrín",
  "Aceite",
  "UCO",
  "Aceite de pollo",
  "Oleína",
  "Interfase",
  "Residuo orgánico",
];

export const PROVEEDORES = [
  "AGD T6",
  "AGD Deheza",
  "Cofco Timbues",
  "Cargill PGSM",
  "Cargill VGG",
  "Falavigna",
];

export const OPERARIOS = ["Adrián Aguirre", "Iván Balmaceda"];

// La descripción guarda el sector de la bomba.
export const BOMBAS = [
  { codigo: "BCI010", descripcion: "Descarga 1" },
  { codigo: "BEL003", descripcion: "Descarga 1" },
  { codigo: "BEL010", descripcion: "Descarga 1" },
  { codigo: "BEL012", descripcion: "Descarga 2" },
  { codigo: "BEL021", descripcion: "Descarga 2" },
  { codigo: "BEL004", descripcion: "Descarga 3" },
  { codigo: "BEL013", descripcion: "Descarga 3" },
];

function codigosTanque(desde: number, hasta: number): string[] {
  const codigos: string[] = [];
  for (let n = desde; n <= hasta; n++) {
    codigos.push(`TK-${String(n).padStart(3, "0")}`);
  }
  return codigos;
}

// TK-001 a TK-012 y TK-101 a TK-119.
export const TANQUES = [...codigosTanque(1, 12), ...codigosTanque(101, 119)];
