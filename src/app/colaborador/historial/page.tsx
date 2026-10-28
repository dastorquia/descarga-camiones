import Link from "next/link";
import type { ReactNode } from "react";
import { EtiquetaEstado, EtiquetaTipo } from "@/modules/descargas/componentes/EtiquetaEstado";
import { buscarHistorial } from "@/modules/descargas/datos";
import { enlaceDePagina, leerFiltros, type Filtros } from "@/modules/descargas/dominio/filtros";
import { formatearHoras, horasBomba } from "@/modules/descargas/dominio/horas";
import { formatearKilos } from "@/modules/descargas/dominio/toneladas";
import { inicioDe, puede } from "@/shared/auth/perfiles";
import { exigirPermiso } from "@/shared/auth/sesion";
import { catalogosActivos } from "@/shared/catalogos/datos";
import { etiquetaBomba } from "@/shared/catalogos/sector";
import { formatearFechaHora } from "@/shared/lib/fechas";
import { Encabezado } from "@/shared/ui/Encabezado";

const control = "min-h-12 w-full rounded-lg border-2 border-slate-300 bg-white px-3 text-base focus:border-blue-700 focus:outline-none";

// Historial (sección 6.6): búsqueda y filtros. El Supervisor puede corregir desde acá.
export default async function Historial({ searchParams }: PageProps<"/colaborador/historial">) {
  const sesion = await exigirPermiso("descargas.operar");
  const filtros = leerFiltros(await searchParams);
  const [resultado, catalogos] = await Promise.all([buscarHistorial(filtros), catalogosActivos()]);
  const puedeEditarFinalizadas = puede(sesion.perfil, "descargas.editarFinalizadas");

  return (
    <>
      <Encabezado perfil={sesion.perfil} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-6">
        <div>
          <Link href={inicioDe(sesion.perfil)} className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
            ← Volver
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Historial</h1>
        </div>

        {/* Formulario GET: los filtros quedan en la dirección y se pueden compartir. */}
        <form className="grid gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Filtro etiqueta="Hoja de ruta o patente">
            <input name="texto" defaultValue={filtros.texto ?? ""} autoComplete="off" className={control} />
          </Filtro>
          <Filtro etiqueta="Desde">
            <input type="date" name="desde" defaultValue={filtros.desde ?? ""} className={control} />
          </Filtro>
          <Filtro etiqueta="Hasta">
            <input type="date" name="hasta" defaultValue={filtros.hasta ?? ""} className={control} />
          </Filtro>
          <Filtro etiqueta="Estado">
            <Seleccion nombre="estado" valor={filtros.estado} opciones={[["EN_CURSO", "En curso"], ["PAUSADA", "Pausada"], ["FINALIZADA", "Finalizada"]]} />
          </Filtro>
          <Filtro etiqueta="Tipo">
            <Seleccion nombre="tipo" valor={filtros.tipo} opciones={[["DESCARGA", "Descarga"], ["CARGA", "Carga"]]} />
          </Filtro>
          <Filtro etiqueta="Producto">
            <Seleccion nombre="productoId" valor={filtros.productoId} opciones={catalogos.productos.map((o) => [o.id, o.nombre])} />
          </Filtro>
          <Filtro etiqueta="Proveedor o cliente">
            <Seleccion nombre="proveedorId" valor={filtros.proveedorId} opciones={catalogos.proveedores.map((o) => [o.id, o.nombre])} />
          </Filtro>
          <Filtro etiqueta="Bomba">
            <Seleccion nombre="bombaId" valor={filtros.bombaId} opciones={catalogos.bombas.map((b) => [b.id, etiquetaBomba(b.codigo, b.sector)])} />
          </Filtro>
          <Filtro etiqueta="Tanque">
            <Seleccion nombre="tanqueId" valor={filtros.tanqueId} opciones={catalogos.tanques.map((o) => [o.id, o.nombre])} />
          </Filtro>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
            <button type="submit" className="min-h-12 rounded-lg bg-blue-700 px-6 font-semibold text-white hover:bg-blue-800">
              Buscar
            </button>
            <Link href="/colaborador/historial" className="flex min-h-12 items-center rounded-lg px-4 font-semibold text-blue-700 hover:bg-blue-50">
              Limpiar filtros
            </Link>
          </div>
        </form>

        <p className="text-slate-600">
          {resultado.total === 1 ? "1 resultado" : `${resultado.total} resultados`}
          {resultado.paginas > 1 && ` · página ${filtros.pagina} de ${resultado.paginas}`}
        </p>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {resultado.descargas.map((d) => {
            const inicio = d.tramos[0]?.inicio;
            const bombas = [...new Set(d.tramos.map((t) => etiquetaBomba(t.bomba.codigo, t.bomba.descripcion)))];
            const editable = d.estado !== "FINALIZADA" || puedeEditarFinalizadas;
            return (
              <div key={d.id} className="flex flex-col gap-1 rounded-xl border-2 border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/colaborador/descargas/${d.id}`} className="mr-auto text-lg font-bold hover:underline">
                    {d.hojaDeRuta}
                  </Link>
                  <EtiquetaTipo tipo={d.tipo} />
                  <EtiquetaEstado estado={d.estado} />
                </div>
                {inicio && <span className="text-sm text-slate-600">Inicio {formatearFechaHora(inicio)}</span>}
                <span>
                  {d.producto.nombre} · {d.proveedor.nombre} · {d.tanque.codigo}
                </span>
                <span className="text-sm">Bomba {bombas.join(", ")}</span>
                <span className="text-sm">
                  {formatearHoras(horasBomba(d.tramos))} de bomba · {formatearKilos(d.toneladas)}
                </span>
                <div className="mt-1 flex gap-3">
                  <Link href={`/colaborador/descargas/${d.id}`} className="font-semibold text-blue-700 hover:underline">
                    Ver
                  </Link>
                  {editable && (
                    <Link href={`/colaborador/descargas/${d.id}/editar`} className="font-semibold text-blue-700 hover:underline">
                      {d.estado === "FINALIZADA" ? "Corregir" : "Editar"}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {resultado.paginas > 1 && <Paginas filtros={filtros} paginas={resultado.paginas} />}
      </main>
    </>
  );
}

function Filtro({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold">{etiqueta}</span>
      {children}
    </label>
  );
}

function Seleccion({ nombre, valor, opciones }: { nombre: string; valor: string | number | null; opciones: [string | number, string][] }) {
  return (
    <select name={nombre} defaultValue={valor === null ? "" : String(valor)} className={control}>
      <option value="">Todos</option>
      {opciones.map(([v, t]) => (
        <option key={v} value={v}>
          {t}
        </option>
      ))}
    </select>
  );
}

function Paginas({ filtros, paginas }: { filtros: Filtros; paginas: number }) {
  const enlace = "flex min-h-11 items-center rounded-lg border-2 border-slate-300 bg-white px-4 font-semibold hover:bg-slate-100";
  return (
    <nav className="flex items-center justify-center gap-3">
      {filtros.pagina > 1 && (
        <Link href={enlaceDePagina(filtros, filtros.pagina - 1)} className={enlace}>
          ← Anterior
        </Link>
      )}
      <span>
        {filtros.pagina} de {paginas}
      </span>
      {filtros.pagina < paginas && (
        <Link href={enlaceDePagina(filtros, filtros.pagina + 1)} className={enlace}>
          Siguiente →
        </Link>
      )}
    </nav>
  );
}
