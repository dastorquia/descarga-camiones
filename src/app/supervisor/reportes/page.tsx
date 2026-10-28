import Link from "next/link";
import { armarReportes } from "@/modules/descargas/reportes/datos";
import { leerFiltrosReporte, parametrosReporte } from "@/modules/descargas/reportes/filtros";
import { mostrar, type Tabla } from "@/modules/descargas/reportes/tabla";
import { exigirPermiso } from "@/shared/auth/sesion";

const control = "min-h-12 w-full rounded-lg border-2 border-slate-300 bg-white px-3 text-base focus:border-blue-700 focus:outline-none";

// Reportes (sección 7), pensados para la computadora del Supervisor.
export default async function Reportes({ searchParams }: PageProps<"/supervisor/reportes">) {
  await exigirPermiso("reportes.ver");
  const filtros = leerFiltrosReporte(await searchParams, new Date());
  const tablas = await armarReportes(filtros);
  const consulta = parametrosReporte(filtros);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6">
      <div>
        <Link href="/supervisor" className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
          ← Volver al tablero
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Reportes</h1>
      </div>

      <form className="grid items-end gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Desde</span>
          <input type="date" name="desde" defaultValue={filtros.desde} className={control} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Hasta</span>
          <input type="date" name="hasta" defaultValue={filtros.hasta} className={control} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Tipo de operación</span>
          <select name="tipo" defaultValue={filtros.tipo ?? ""} className={control}>
            <option value="">Descargas y cargas</option>
            <option value="DESCARGA">Solo descargas</option>
            <option value="CARGA">Solo cargas</option>
          </select>
        </label>
        <button type="submit" className="min-h-12 rounded-lg bg-blue-700 px-6 font-semibold text-white hover:bg-blue-800">
          Ver reportes
        </button>
        <a
          href={`/api/supervisor/reportes?formato=xlsx&${consulta}`}
          className="flex min-h-12 items-center justify-center rounded-lg border-2 border-green-700 px-4 font-semibold text-green-800 hover:bg-green-50"
        >
          Descargar Excel (todo)
        </a>
      </form>

      <nav className="flex flex-wrap gap-2 text-sm">
        {tablas.map((t) => (
          <a key={t.id} href={`#${t.id}`} className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold hover:bg-slate-200">
            {t.titulo}
          </a>
        ))}
      </nav>

      {tablas.map((t) => (
        <TablaReporte key={t.id} tabla={t} csv={`/api/supervisor/reportes?formato=csv&tabla=${t.id}&${consulta}`} />
      ))}
    </main>
  );
}

function TablaReporte({ tabla, csv }: { tabla: Tabla; csv: string }) {
  const numerica = (i: number) => tabla.columnas[i]!.tipo !== "texto";
  return (
    <section id={tabla.id} className="flex scroll-mt-4 flex-col gap-2 rounded-2xl border-2 border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{tabla.titulo}</h2>
        <a href={csv} className="rounded-lg px-3 py-1.5 font-semibold text-blue-700 hover:bg-blue-50">
          Descargar CSV
        </a>
      </div>
      {tabla.descripcion && <p className="text-sm text-slate-600">{tabla.descripcion}</p>}
      {tabla.filas.length === 0 ? (
        <p className="text-slate-600">No hay datos en el período elegido.</p>
      ) : (
        <div className="max-h-[32rem] overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-white">
              <tr>
                {tabla.columnas.map((c, i) => (
                  <th key={c.titulo} className={`border-b-2 border-slate-200 px-2 py-2 font-semibold whitespace-nowrap ${numerica(i) ? "text-right" : "text-left"}`}>
                    {c.titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabla.filas.map((fila, f) => (
                <tr key={f} className="border-b border-slate-100 hover:bg-slate-50">
                  {fila.map((v, i) => (
                    <td key={i} className={`px-2 py-1.5 whitespace-nowrap ${numerica(i) ? "text-right tabular-nums" : ""}`}>
                      {mostrar(v, tabla.columnas[i]!.tipo)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
