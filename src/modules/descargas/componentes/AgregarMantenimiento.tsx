"use client";

import { useState } from "react";
import { Desplegable } from "@/shared/ui/campos";
import { mensajeError } from "@/shared/ui/estilos";
import { useFormulario } from "@/shared/ui/useFormulario";
import { ponerEnMantenimiento, type EstadoMantenimiento } from "../mantenimiento-acciones";

/** Formulario para poner en mantenimiento una bomba libre (no en uso). */
export function AgregarMantenimiento({ bombasLibres }: { bombasLibres: { id: number; etiqueta: string }[] }) {
  const { estado, alEnviar, enviando } = useFormulario<EstadoMantenimiento>(ponerEnMantenimiento, {});
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        disabled={bombasLibres.length === 0}
        className="min-h-12 rounded-xl border-2 border-dashed border-orange-300 px-4 font-semibold text-orange-800 hover:bg-orange-50 disabled:opacity-50"
      >
        + Poner una bomba en mantenimiento
      </button>
    );
  }

  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-3 rounded-xl border-2 border-orange-300 bg-orange-50 p-3 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-1">
        <span className="text-sm font-semibold">Bomba</span>
        <Desplegable nombre="bombaId" opciones={bombasLibres.map((b) => ({ valor: b.id, texto: b.etiqueta }))} />
      </label>
      <label className="flex flex-1 flex-col gap-1">
        <span className="text-sm font-semibold">Motivo (opcional)</span>
        <input name="motivo" maxLength={200} className="min-h-14 rounded-xl border-2 border-slate-300 bg-white px-3 text-base" />
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={enviando} className="min-h-14 rounded-xl bg-orange-600 px-4 font-semibold text-white hover:bg-orange-700">
          {enviando ? "Guardando…" : "Poner en mantenimiento"}
        </button>
        <button type="button" onClick={() => setAbierto(false)} className="min-h-14 rounded-xl px-3 font-semibold">
          Cancelar
        </button>
      </div>
      {estado.error && <p className={`${mensajeError} sm:basis-full`}>{estado.error}</p>}
    </form>
  );
}
