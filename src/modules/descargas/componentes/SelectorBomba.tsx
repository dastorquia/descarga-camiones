"use client";

import { useState } from "react";
import type { OpcionBomba } from "@/shared/catalogos/datos";
import { etiquetaBomba, nombreBomba } from "@/shared/catalogos/sector";
import { Desplegable } from "@/shared/ui/campos";

/**
 * Desplegable de bombas: "D1-BCI010". Las bombas en uso o en mantenimiento aparecen deshabilitadas.
 * Al elegir una, se muestra en negrita "Descarga 1 · Bomba BCI010".
 */
export function SelectorBomba({
  bombas,
  noDisponibles,
  inicial = "",
}: {
  bombas: OpcionBomba[];
  noDisponibles: Record<number, string>;
  inicial?: string;
}) {
  const [bombaId, setBombaId] = useState(inicial);
  const elegida = bombas.find((b) => String(b.id) === bombaId);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-base font-semibold">Bomba</span>
      <Desplegable
        nombre="bombaId"
        valor={bombaId}
        alCambiar={setBombaId}
        opciones={bombas.map((b) => {
          const motivo = noDisponibles[b.id];
          const texto = etiquetaBomba(b.codigo, b.sector);
          return { valor: b.id, texto: motivo ? `${texto} — ${motivo}` : texto, deshabilitada: !!motivo };
        })}
      />
      {elegida && <span className="text-base font-bold text-slate-800">{nombreBomba(elegida.codigo, elegida.sector)}</span>}
    </div>
  );
}
