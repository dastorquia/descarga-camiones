"use client";

import { guardarUmbrales, type EstadoUmbrales } from "@/shared/config/acciones";
import type { Umbrales } from "@/shared/config/leer";
import { Campo, Texto } from "@/shared/ui/campos";
import { botonPrincipal, mensajeError, mensajeExito } from "@/shared/ui/estilos";
import { useFormulario } from "@/shared/ui/useFormulario";

const conComa = (n: number) => String(n).replace(".", ",");

export function FormularioUmbrales({ actuales }: { actuales: Umbrales }) {
  const { estado, alEnviar, enviando } = useFormulario<EstadoUmbrales>(guardarUmbrales, {});
  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-base font-semibold">
          Rango habitual de toneladas por camión. Fuera de este rango la app advierte, pero deja seguir.
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Mínimo (t)">
            <Texto name="toneladasMin" inputMode="decimal" defaultValue={conComa(actuales.toneladasMin)} required />
          </Campo>
          <Campo etiqueta="Máximo (t)">
            <Texto name="toneladasMax" inputMode="decimal" defaultValue={conComa(actuales.toneladasMax)} required />
          </Campo>
        </div>
      </fieldset>
      <Campo etiqueta="Alerta de tramo abierto (horas)" ayuda="Un tramo abierto más de estas horas se marca en rojo en el tablero.">
        <Texto name="horasAlertaTramoAbierto" inputMode="numeric" defaultValue={actuales.horasAlertaTramoAbierto} required />
      </Campo>
      {estado.error && (
        <p role="alert" className={mensajeError}>
          {estado.error}
        </p>
      )}
      {estado.exito && (
        <p role="status" className={mensajeExito}>
          {estado.exito}
        </p>
      )}
      <button type="submit" className={botonPrincipal} disabled={enviando}>
        {enviando ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
