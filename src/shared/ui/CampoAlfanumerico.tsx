"use client";

import { useState } from "react";

/** Deja solo letras y números, en mayúsculas y sin espacios. */
function soloAlfanumerico(texto: string): string {
  return texto.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * Campo que no permite escribir espacios ni caracteres especiales:
 * se filtran mientras se tipea. El servidor vuelve a validar igual.
 */
export function CampoAlfanumerico({ nombre, maximo, inicial = "" }: { nombre: string; maximo: number; inicial?: string }) {
  const [valor, setValor] = useState(inicial);
  return (
    <input
      name={nombre}
      value={valor}
      onChange={(e) => setValor(soloAlfanumerico(e.target.value).slice(0, maximo))}
      required
      autoCapitalize="characters"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      pattern="[A-Z0-9]+"
      className="min-h-14 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-lg tracking-wide uppercase focus:border-blue-700 focus:outline-none"
    />
  );
}
