"use client";

import { mensajeError, mensajeExito } from "@/shared/ui/estilos";
import { useFormulario } from "@/shared/ui/useFormulario";
import { cambiarActivo, guardarItem, type EstadoCatalogo } from "./acciones";
import type { ItemCatalogo } from "./admin";
import { CATALOGOS, type Catalogo } from "./validacion";

const campo =
  "min-h-12 w-full rounded-lg border-2 border-slate-300 bg-white px-3 text-base focus:border-blue-700 focus:outline-none";
const boton = "min-h-12 rounded-lg px-4 font-semibold disabled:opacity-60";

/** Administración de un catálogo: alta, edición y desactivación (nunca se borra). */
export function AdminCatalogo({ catalogo, items, sectores }: { catalogo: Catalogo; items: ItemCatalogo[]; sectores: string[] }) {
  const config = CATALOGOS[catalogo];
  const activos = items.filter((i) => i.activo);
  const inactivos = items.filter((i) => !i.activo);

  return (
    <div className="flex flex-col gap-6">
      <datalist id="sectores">
        {sectores.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <section className="rounded-2xl border-2 border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-bold">Agregar {config.singular}</h2>
        <FormularioItem catalogo={catalogo} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">
          Activos <span className="text-slate-500">({activos.length})</span>
        </h2>
        {activos.map((i) => (
          <Fila key={i.id} catalogo={catalogo} item={i} />
        ))}
      </section>

      {inactivos.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">
            Desactivados <span className="text-slate-500">({inactivos.length})</span>
          </h2>
          <p className="text-sm text-slate-600">No se pueden elegir en las descargas nuevas, pero se conservan en el historial.</p>
          {inactivos.map((i) => (
            <Fila key={i.id} catalogo={catalogo} item={i} />
          ))}
        </section>
      )}
    </div>
  );
}

function FormularioItem({ catalogo, item }: { catalogo: Catalogo; item?: ItemCatalogo }) {
  const config = CATALOGOS[catalogo];
  const { estado, alEnviar, enviando } = useFormulario<EstadoCatalogo>(guardarItem, {});
  return (
    // En el alta, la key vacía el formulario después de agregar.
    <form key={item ? item.id : estado.exito} onSubmit={alEnviar} className="flex flex-col gap-2">
      <input type="hidden" name="catalogo" value={catalogo} />
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex min-w-40 flex-1 flex-col gap-1">
          <span className="text-sm font-semibold">{config.etiqueta}</span>
          <input name="valor" defaultValue={item?.valor} required autoComplete="off" className={campo} />
        </label>
        {catalogo === "bombas" && (
          <label className="flex min-w-40 flex-1 flex-col gap-1">
            <span className="text-sm font-semibold">Sector</span>
            <input name="sector" defaultValue={item?.sector ?? ""} list="sectores" autoComplete="off" placeholder="Descarga 1" className={campo} />
          </label>
        )}
        <button type="submit" disabled={enviando} className={`${boton} bg-blue-700 text-white hover:bg-blue-800`}>
          {enviando ? "Guardando…" : item ? "Guardar" : "Agregar"}
        </button>
      </div>
      {!item && config.ayuda && <span className="text-sm text-slate-600">{config.ayuda}</span>}
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
    </form>
  );
}

function Fila({ catalogo, item }: { catalogo: Catalogo; item: ItemCatalogo }) {
  const { estado, alEnviar, enviando } = useFormulario<EstadoCatalogo>(cambiarActivo, {});
  return (
    <div className={`flex flex-col gap-2 rounded-xl border-2 p-3 ${item.activo ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-100"}`}>
      <FormularioItem catalogo={catalogo} item={item} />
      <form onSubmit={alEnviar} className="flex justify-end">
        <input type="hidden" name="catalogo" value={catalogo} />
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="activo" value={String(!item.activo)} />
        <button
          type="submit"
          disabled={enviando}
          className={`${boton} min-h-10 ${item.activo ? "text-red-700 hover:bg-red-50" : "text-green-800 hover:bg-green-50"}`}
        >
          {item.activo ? "Desactivar" : "Reactivar"}
        </button>
      </form>
      {estado.error && (
        <p role="alert" className={mensajeError}>
          {estado.error}
        </p>
      )}
    </div>
  );
}
