"use client";

import { useState } from "react";
import { mensajeError } from "@/shared/ui/estilos";
import { useFormulario } from "@/shared/ui/useFormulario";
import { ponerEnMantenimiento, terminarMantenimiento, type EstadoMantenimiento } from "../mantenimiento-acciones";

const boton = "min-h-11 rounded-lg px-3 text-sm font-semibold disabled:opacity-60";

/** Botón para poner o sacar una bomba de mantenimiento, con confirmación. */
export function AccionMantenimiento({
  bombaId,
  codigo,
  enMantenimiento,
  enUso,
}: {
  bombaId: number;
  codigo: string;
  enMantenimiento: boolean;
  enUso: boolean;
}) {
  const poner = useFormulario<EstadoMantenimiento>(ponerEnMantenimiento, {});
  const terminar = useFormulario<EstadoMantenimiento>(terminarMantenimiento, {});
  const [confirmando, setConfirmando] = useState(false);

  if (enMantenimiento) {
    return (
      <form onSubmit={terminar.alEnviar} className="flex flex-col items-start gap-1">
        <input type="hidden" name="bombaId" value={bombaId} />
        <button type="submit" disabled={terminar.enviando} className={`${boton} bg-green-700 text-white hover:bg-green-800`}>
          {terminar.enviando ? "Guardando…" : "Terminar mantenimiento"}
        </button>
        {terminar.estado.error && <p className={mensajeError}>{terminar.estado.error}</p>}
      </form>
    );
  }

  if (enUso) return <span className="text-sm text-slate-500">—</span>;

  if (!confirmando) {
    return (
      <button type="button" onClick={() => setConfirmando(true)} className={`${boton} border-2 border-orange-400 text-orange-800 hover:bg-orange-50`}>
        Poner en mantenimiento
      </button>
    );
  }

  return (
    <form onSubmit={poner.alEnviar} className="flex min-w-60 flex-col gap-2 rounded-lg border-2 border-orange-300 bg-orange-50 p-2">
      <input type="hidden" name="bombaId" value={bombaId} />
      <span className="text-sm font-semibold">¿Poner la bomba {codigo} en mantenimiento?</span>
      <input
        name="motivo"
        maxLength={200}
        placeholder="Motivo (opcional)"
        className="min-h-11 rounded-lg border-2 border-slate-300 bg-white px-2 text-base"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={poner.enviando} className={`${boton} bg-orange-600 text-white hover:bg-orange-700`}>
          {poner.enviando ? "Guardando…" : "Sí, poner"}
        </button>
        <button type="button" disabled={poner.enviando} onClick={() => setConfirmando(false)} className={boton}>
          Cancelar
        </button>
      </div>
      {poner.estado.error && <p className={mensajeError}>{poner.estado.error}</p>}
    </form>
  );
}
