// Catálogos iniciales para una base nueva (actualizados el 29/10/2026).
// En producción se cargaron con migraciones; el seed no duplica nada.

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

export const PROVEEDORES = Array.from({ length: 10 }, (_, i) => `Proveedor ${i + 1}`);

export const OPERARIOS = Array.from({ length: 6 }, (_, i) => `Colaborador ${i + 1}`);

// La descripción guarda el sector de la bomba.
export const BOMBAS = [
  { codigo: "BCI010", descripcion: "Descarga 1" },
  { codigo: "BEL003", descripcion: "Descarga 1" },
  { codigo: "BEL010", descripcion: "Descarga 1" },
  { codigo: "BEL012", descripcion: "Descarga 2" },
  { codigo: "BEL021", descripcion: "Descarga 2" },
  { codigo: "BEL004", descripcion: "Descarga 3" },
  { codigo: "BEL013", descripcion: "Descarga 3" },
  { codigo: "BEL019", descripcion: "Descarga 4" },
  { codigo: "BCN201", descripcion: "Descarga 4" },
  { codigo: "BEL101", descripcion: "Otro" },
  { codigo: "BEL102", descripcion: "Otro" },
];

function codigosTanque(desde: number, hasta: number): string[] {
  const codigos: string[] = [];
  for (let n = desde; n <= hasta; n++) {
    codigos.push(`TK-${String(n).padStart(3, "0")}`);
  }
  return codigos;
}

// TK-001 a TK-012, TK-025 a TK-027, TK-101 a TK-119, TK-706, TK-707, PLT-801 y PLT-802.
export const TANQUES = [
  ...codigosTanque(1, 12),
  ...codigosTanque(25, 27),
  ...codigosTanque(101, 119),
  "TK-706",
  "TK-707",
  "PLT-801",
  "PLT-802",
];
