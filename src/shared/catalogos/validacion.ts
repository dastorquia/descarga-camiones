// Catálogos administrables (sección 6.7) y la normalización de sus valores.

export const CATALOGOS = {
  bombas: { titulo: "Bombas", singular: "bomba", etiqueta: "Código", ayuda: "Por ejemplo BCI010." },
  tanques: { titulo: "Tanques", singular: "tanque", etiqueta: "Código", ayuda: "Formato TK-001." },
  productos: { titulo: "Productos", singular: "producto", etiqueta: "Nombre", ayuda: undefined },
  proveedores: { titulo: "Proveedores y clientes", singular: "proveedor o cliente", etiqueta: "Nombre", ayuda: undefined },
  operarios: { titulo: "Operarios", singular: "operario", etiqueta: "Nombre", ayuda: undefined },
} as const;

export type Catalogo = keyof typeof CATALOGOS;

export function esCatalogo(valor: unknown): valor is Catalogo {
  return typeof valor === "string" && Object.hasOwn(CATALOGOS, valor);
}

type Resultado = { ok: true; valor: string } | { ok: false; error: string };

export function normalizarNombre(texto: string): Resultado {
  const valor = texto.trim().replace(/\s+/g, " ");
  if (valor === "") return { ok: false, error: "Escribí el nombre." };
  if (valor.length > 60) return { ok: false, error: "El nombre es demasiado largo (máximo 60 caracteres)." };
  return { ok: true, valor };
}

/** "tk1", "TK 001" o "TK-001" → "TK-001". */
export function normalizarTanque(texto: string): Resultado {
  const m = /^TK-?(\d{1,3})$/.exec(texto.toUpperCase().replace(/\s/g, ""));
  if (!m) return { ok: false, error: "El código del tanque tiene el formato TK-001." };
  return { ok: true, valor: `TK-${m[1]!.padStart(3, "0")}` };
}

export function normalizarCodigoBomba(texto: string): Resultado {
  const valor = texto.toUpperCase().replace(/\s/g, "");
  if (!/^[A-Z0-9]{2,15}$/.test(valor)) {
    return { ok: false, error: "El código de la bomba lleva de 2 a 15 letras y números." };
  }
  return { ok: true, valor };
}

/** Sector de la bomba ("Descarga 1"); vacío se guarda sin sector. */
export function normalizarSector(texto: string): Resultado {
  const valor = texto.trim().replace(/\s+/g, " ");
  if (valor.length > 30) return { ok: false, error: "El sector es demasiado largo." };
  return { ok: true, valor };
}

export function normalizarValor(catalogo: Catalogo, texto: string): Resultado {
  if (catalogo === "tanques") return normalizarTanque(texto);
  if (catalogo === "bombas") return normalizarCodigoBomba(texto);
  return normalizarNombre(texto);
}
