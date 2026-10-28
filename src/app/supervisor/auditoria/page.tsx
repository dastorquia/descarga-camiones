import Link from "next/link";
import type { ReactNode } from "react";
import { exigirPermiso } from "@/shared/auth/sesion";
import { buscarAuditoria } from "@/shared/auditoria/datos";
import { describirCambios, NOMBRE_ACCION, NOMBRE_ENTIDAD } from "@/shared/auditoria/describir";
import { ACCIONES, enlaceAuditoria, GRUPOS, leerFiltrosAuditoria, type Grupo } from "@/shared/auditoria/filtros";
import { formatearFechaHora } from "@/shared/lib/fechas";

const control = "min-h-12 w-full rounded-lg border-2 border-slate-300 bg-white px-3 text-base focus:border-blue-700 focus:outline-none";

const COLOR_ACCION: Record<string, string> = {
  CREAR: "bg-green-100 text-green-800",
  EDITAR: "bg-blue-100 text-blue-800",
  DESACTIVAR: "bg-amber-100 text-amber-900",
  REACTIVAR: "bg-green-100 text-green-800",
  ELIMINAR: "bg-red-100 text-red-800",
};

// Registro de cambios (auditoría): quién cambió qué y cuándo. Solo el Supervisor.
export default async function Auditoria({ searchParams }: PageProps<"/supervisor/auditoria">) {
  await exigirPermiso("auditoria.ver");
  const filtros = leerFiltrosAuditoria(await searchParams);
  const r = await buscarAuditoria(filtros);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-6">
      <div>
        <Link href="/supervisor/administracion" className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
          ← Volver a Administración
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Registro de cambios</h1>
        {filtros.descargaId && (
          <p className="text-slate-600">
            Solo los cambios de una descarga.{" "}
            <Link href="/supervisor/auditoria" className="font-semibold text-blue-700 hover:underline">
              Ver todos
            </Link>
          </p>
        )}
      </div>

      <form className="grid gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        {filtros.descargaId && <input type="hidden" name="descargaId" value={filtros.descargaId} />}
        <Filtro etiqueta="Qué">
          <select name="grupo" defaultValue={filtros.grupo ?? ""} className={control}>
            <option value="">Todo</option>
            {(Object.keys(GRUPOS) as Grupo[]).map((g) => (
              <option key={g} value={g}>
                {GRUPOS[g].texto}
              </option>
            ))}
          </select>
        </Filtro>
        <Filtro etiqueta="Acción">
          <select name="accion" defaultValue={filtros.accion ?? ""} className={control}>
            <option value="">Todas</option>
            {ACCIONES.map((a) => (
              <option key={a} value={a}>
                {NOMBRE_ACCION[a]}
              </option>
            ))}
          </select>
        </Filtro>
        <Filtro etiqueta="Desde">
          <input type="date" name="desde" defaultValue={filtros.desde ?? ""} className={control} />
        </Filtro>
        <Filtro etiqueta="Hasta">
          <input type="date" name="hasta" defaultValue={filtros.hasta ?? ""} className={control} />
        </Filtro>
        <div className="flex items-end">
          <button type="submit" className="min-h-12 w-full rounded-lg bg-blue-700 px-6 font-semibold text-white hover:bg-blue-800">
            Filtrar
          </button>
        </div>
      </form>

      <p className="text-slate-600">
        {r.total === 1 ? "1 cambio" : `${r.total} cambios`}
        {r.paginas > 1 && ` · página ${filtros.pagina} de ${r.paginas}`}
      </p>

      <ol className="flex flex-col gap-3">
        {r.registros.map((reg) => {
          const cambios = describirCambios(reg.antes, reg.despues, r.nombres);
          return (
            <li key={reg.id} className="flex flex-col gap-2 rounded-xl border-2 border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${COLOR_ACCION[reg.accion] ?? "bg-slate-100"}`}>
                  {NOMBRE_ACCION[reg.accion] ?? reg.accion}
                </span>
                <span className="font-bold">
                  {NOMBRE_ENTIDAD[reg.entidad] ?? reg.entidad}
                  {reg.nombreElemento && ` ${reg.nombreElemento}`}
                </span>
                {reg.hojaDeRuta && reg.descargaId && (
                  <Link href={`/colaborador/descargas/${reg.descargaId}`} className="font-semibold text-blue-700 hover:underline">
                    {reg.hojaDeRuta}
                  </Link>
                )}
                <span className="ml-auto text-sm text-slate-600">
                  {formatearFechaHora(reg.fecha)} · {reg.perfil === "SUPERVISOR" ? "Supervisor" : "Colaborador"}
                </span>
              </div>
              {cambios.length > 0 && (
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="py-1 pr-3 font-semibold">Dato</th>
                      <th className="py-1 pr-3 font-semibold">Antes</th>
                      <th className="py-1 font-semibold">Después</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cambios.map((c) => (
                      <tr key={c.campo} className="border-t border-slate-100 align-top">
                        <td className="py-1 pr-3 font-semibold">{c.campo}</td>
                        <td className="py-1 pr-3 break-words text-slate-600">{c.antes}</td>
                        <td className="py-1 break-words">{c.despues}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </li>
          );
        })}
      </ol>

      {r.paginas > 1 && (
        <nav className="flex items-center justify-center gap-3">
          {filtros.pagina > 1 && (
            <Link href={enlaceAuditoria(filtros, filtros.pagina - 1)} className="flex min-h-11 items-center rounded-lg border-2 border-slate-300 bg-white px-4 font-semibold">
              ← Anterior
            </Link>
          )}
          <span>
            {filtros.pagina} de {r.paginas}
          </span>
          {filtros.pagina < r.paginas && (
            <Link href={enlaceAuditoria(filtros, filtros.pagina + 1)} className="flex min-h-11 items-center rounded-lg border-2 border-slate-300 bg-white px-4 font-semibold">
              Siguiente →
            </Link>
          )}
        </nav>
      )}
    </main>
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
