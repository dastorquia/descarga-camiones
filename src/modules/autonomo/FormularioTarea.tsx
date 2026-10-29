"use client";

import { useState } from "react";
import type { Opcion } from "@/shared/catalogos/datos";
import { aDiaHora } from "@/shared/lib/fechas";
import { Campo, DiaHora, Desplegable } from "@/shared/ui/campos";
import { botonPrincipal, mensajeError } from "@/shared/ui/estilos";
import { useFormulario } from "@/shared/ui/useFormulario";
import { registrarTarea, type EstadoAutonomo } from "./acciones";
import { LISTA_TAREAS, TAREAS } from "./tareas";

/** Registro de una tarea de mantenimiento autónomo. */
export function FormularioTarea({ bombas, operarios }: { bombas: { id: number; etiqueta: string }[]; operarios: Opcion[] }) {
  const { estado, alEnviar, enviando } = useFormulario<EstadoAutonomo>(registrarTarea, {});
  const [ahora] = useState(() => aDiaHora(new Date()));
  if (bombas.length === 0) {
    return <p className="text-slate-600">Todavía no hay bombas con mantenimiento autónomo. Las marca el Supervisor en Administración → Bombas.</p>;
  }
  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-5">
      <Campo etiqueta="Bomba">
        <Desplegable nombre="bombaId" opciones={bombas.map((b) => ({ valor: b.id, texto: b.etiqueta }))} />
      </Campo>
      <Campo etiqueta="Tarea">
        <Desplegable nombre="tarea" opciones={LISTA_TAREAS.map((t) => ({ valor: t, texto: TAREAS[t] }))} />
      </Campo>
      <Campo etiqueta="Colaborador">
        <Desplegable nombre="operarioId" opciones={operarios.map((o) => ({ valor: o.id, texto: o.nombre }))} />
      </Campo>
      <DiaHora etiqueta="Día y hora" dia={ahora.dia} hora={ahora.hora} />
      {estado.error && (
        <p role="alert" className={mensajeError}>
          {estado.error}
        </p>
      )}
      <button type="submit" className={botonPrincipal} disabled={enviando}>
        {enviando ? "Guardando…" : "Registrar tarea"}
      </button>
    </form>
  );
}
