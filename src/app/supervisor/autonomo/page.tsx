import Link from "next/link";
import { historialTareas, ultimasTareas } from "@/modules/autonomo/datos";
import { LISTA_TAREAS, TAREAS } from "@/modules/autonomo/tareas";
import { exigirPermiso } from "@/shared/auth/sesion";
import { etiquetaBomba } from "@/shared/catalogos/sector";
import { formatearFechaHora } from "@/shared/lib/fechas";
import { BotonCsv, BotonExcel } from "@/shared/ui/Exportar";
import { Celda, TablaDatos } from "@/shared/ui/TablaDatos";

// Mantenimiento autónomo: última vez de cada tarea por bomba e historial filtrable por bomba.
export default async function Autonomo({ searchParams }: PageProps<"/supervisor/autonomo">) {
  await exigirPermiso("reportes.ver");
  const pedido = Number((await searchParams).bombaId);
  const bombaId = Number.isInteger(pedido) && pedido > 0 ? pedido : null;
  const [ultimas, historial] = await Promise.all([ultimasTareas(), historialTareas(bombaId)]);
  const filtro = bombaId ? `&bombaId=${bombaId}` : "";

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6">
      <Link href="/supervisor" className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
        ← Volver al tablero
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Mantenimiento autónomo</h1>
        <BotonExcel href={`/supervisor/autonomo/exportar?formato=xlsx${filtro}`} />
      </div>

      <section className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Última vez de cada tarea</h2>
          <BotonCsv href="/supervisor/autonomo/exportar?formato=csv&tabla=ultima_vez" />
        </div>
        <TablaDatos
          columnas={["Bomba", ...LISTA_TAREAS.map((t) => TAREAS[t])]}
          vacio={ultimas.length === 0 ? "No hay bombas con mantenimiento autónomo. Se marcan en Administración → Bombas." : undefined}
        >
          {ultimas.map((b) => (
            <tr key={b.id}>
              <Celda className="font-semibold">
                <Link href={`/supervisor/autonomo?bombaId=${b.id}`} className="text-blue-700 hover:underline">
                  {b.etiqueta}
                </Link>
              </Celda>
              {LISTA_TAREAS.map((t) => {
                const u = b.ultima.get(t);
                return (
                  <Celda key={t} className="!whitespace-normal">
                    {u ? (
                      <>
                        {formatearFechaHora(u.fecha)}
                        <span className="block text-xs text-slate-600">{u.operario}</span>
                      </>
                    ) : (
                      <span className="text-slate-500">Nunca</span>
                    )}
                  </Celda>
                );
              })}
            </tr>
          ))}
        </TablaDatos>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">{bombaId ? "Historial de la bomba elegida" : "Historial (últimas 100)"}</h2>
          <div className="flex flex-wrap items-center gap-2">
            {bombaId && (
              <Link href="/supervisor/autonomo" className="font-semibold text-blue-700 hover:underline">
                Ver todas las bombas
              </Link>
            )}
            <BotonCsv href={`/supervisor/autonomo/exportar?formato=csv&tabla=historial${filtro}`} texto="Descargar CSV (completo)" />
          </div>
        </div>
        <TablaDatos
          columnas={["Día y hora", "Bomba", "Tarea", "Colaborador", "Observaciones"]}
          vacio={historial.length === 0 ? "Todavía no hay tareas registradas." : undefined}
        >
          {historial.map((t) => (
            <tr key={t.id}>
              <Celda>{formatearFechaHora(t.fecha)}</Celda>
              <Celda>{etiquetaBomba(t.bomba.codigo, t.bomba.descripcion)}</Celda>
              <Celda>{TAREAS[t.tarea]}</Celda>
              <Celda>{t.operario.nombre}</Celda>
              <Celda className="min-w-48 !whitespace-normal">{t.observaciones ?? "—"}</Celda>
            </tr>
          ))}
        </TablaDatos>
      </section>
    </main>
  );
}
