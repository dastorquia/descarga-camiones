"use client";

import { useFormulario } from "@/shared/ui/useFormulario";
import { cambiarAutonomo, type EstadoAutonomo } from "./acciones";

/** Tilde "requiere mantenimiento autónomo" de una bomba (Administración). */
export function TildeAutonomo({ bombaId, etiqueta, requiere }: { bombaId: number; etiqueta: string; requiere: boolean }) {
  const { estado, enviar, enviando } = useFormulario<EstadoAutonomo>(cambiarAutonomo, {});
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-lg border-2 border-slate-200 bg-white px-3">
      <input
        type="checkbox"
        className="size-5"
        checked={requiere}
        disabled={enviando}
        onChange={(e) => {
          const datos = new FormData();
          datos.set("bombaId", String(bombaId));
          datos.set("requiere", String(e.target.checked));
          enviar(datos);
        }}
      />
      <span className="font-semibold">{etiqueta}</span>
      {estado.error && <span className="text-sm text-red-700">{estado.error}</span>}
    </label>
  );
}
