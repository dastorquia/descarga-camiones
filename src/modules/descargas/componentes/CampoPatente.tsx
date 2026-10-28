"use client";

import { useState } from "react";
import { formatearPatenteAlEscribir, LARGO_MAXIMO_PATENTE } from "../dominio/reglas";

/** Patente camión/acoplado: la barra se agrega sola al completar la del camión. */
export function CampoPatente({ inicial = "" }: { inicial?: string }) {
  const [valor, setValor] = useState(inicial);
  return (
    <input
      name="patente"
      value={valor}
      onChange={(e) => setValor(formatearPatenteAlEscribir(e.target.value, valor))}
      required
      maxLength={LARGO_MAXIMO_PATENTE}
      placeholder="AB123CD/AC456EF"
      autoCapitalize="characters"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      className="min-h-14 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-lg tracking-wide uppercase focus:border-blue-700 focus:outline-none"
    />
  );
}
