"use client";

import { useActionState } from "react";
import { cambiarPin, type EstadoFormulario } from "@/shared/auth/acciones";
import { botonPrincipal, campoTexto, mensajeError, mensajeExito } from "@/shared/ui/estilos";

function CampoPin({ nombre, etiqueta }: { nombre: string; etiqueta: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-lg font-medium">{etiqueta}</span>
      <input
        name={nombre}
        type="password"
        inputMode="numeric"
        pattern="\d*"
        maxLength={8}
        autoComplete="off"
        required
        className={campoTexto}
      />
    </label>
  );
}

export function FormularioCambioPin() {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(cambiarPin, {});

  return (
    // La key vacía el formulario después de un cambio exitoso.
    <form key={estado.exito ?? "formulario"} action={accion} className="flex flex-col gap-5">
      <CampoPin nombre="actual" etiqueta="PIN actual" />
      <CampoPin nombre="nuevo" etiqueta="PIN nuevo (de 4 a 8 números)" />
      <CampoPin nombre="repetido" etiqueta="Repetí el PIN nuevo" />

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
        {enviando ? "Guardando…" : "Cambiar PIN"}
      </button>
    </form>
  );
}
