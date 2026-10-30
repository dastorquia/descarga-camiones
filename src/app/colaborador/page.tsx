import Link from "next/link";
import { AccionMantenimiento } from "@/modules/descargas/componentes/AccionMantenimiento";
import { AgregarMantenimiento } from "@/modules/descargas/componentes/AgregarMantenimiento";
import { descargasActivas, descargasFinalizadasHoy, estadoBombasActual } from "@/modules/descargas/datos";
import { tarjeta } from "@/modules/descargas/tablero-supervisor/datos";
import { TarjetasDescargas } from "@/modules/descargas/tablero-supervisor/TarjetasDescargas";
import { exigirPermiso } from "@/shared/auth/sesion";
import { etiquetaBomba } from "@/shared/catalogos/sector";
import { formatearFechaHora } from "@/shared/lib/fechas";
import { Actualizador } from "@/shared/ui/Actualizador";
import { Encabezado } from "@/shared/ui/Encabezado";
import { botonPrincipal, botonSecundario, mensajeExito } from "@/shared/ui/estilos";

// Inicio del Colaborador (sección 6.2 y 13): tarjetas de Pendientes, En curso y
// Finalizadas hoy, y abajo las bombas en mantenimiento.
export default async function TableroColaborador({ searchParams }: PageProps<"/colaborador">) {
  const sesion = await exigirPermiso("descargas.operar");
  const { registrado } = await searchParams;
  const [activas, finalizadas, bombas] = await Promise.all([descargasActivas(), descargasFinalizadasHoy(), estadoBombasActual()]);
  const sectores = [...new Set(bombas.map((b) => b.sector).filter((s): s is string => s !== null))].sort();

  // Más antiguas primero, como en el tablero del Supervisor.
  const porInicio = (a: { tramoAbiertoDesde: string | null }, b: { tramoAbiertoDesde: string | null }) =>
    (a.tramoAbiertoDesde ?? "").localeCompare(b.tramoAbiertoDesde ?? "");
  const datos = {
    pendientes: activas.filter((d) => d.estado === "PAUSADA").map(tarjeta),
    enCurso: activas.filter((d) => d.estado === "EN_CURSO").map(tarjeta).sort(porInicio),
    finalizadas: finalizadas.map(tarjeta),
  };
  const enMantenimiento = bombas.filter((b) => b.mantenimiento);
  const libres = bombas.filter((b) => !b.mantenimiento && !b.ocupadaPor);

  return (
    <>
      <Encabezado perfil={sesion.perfil} />
      {/* Para el Supervisor no se actualiza solo: así su sesión vence por inactividad. */}
      {sesion.perfil === "COLABORADOR" && <Actualizador segundos={30} />}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Link href="/colaborador/nueva" className={`${botonPrincipal} min-h-16 text-xl md:max-w-xs`}>
            + Nueva descarga
          </Link>
          <Link href="/colaborador/movimientos/nuevo" className={`${botonSecundario} md:max-w-56`}>
            + Nuevo movimiento
          </Link>
          <Link href="/colaborador/autonomo/nuevo" className={`${botonSecundario} md:max-w-64`}>
            + Mant. autónomo
          </Link>
          <Link href="/colaborador/historial" className={`${botonSecundario} md:max-w-48`}>
            Historial
          </Link>
          <div className="flex flex-wrap items-center gap-2 md:ml-auto">
            <span className="text-sm font-semibold text-slate-600">Agregar en:</span>
            {sectores.map((s) => (
              <Link
                key={s}
                href={`/colaborador/nueva?sector=${encodeURIComponent(s)}`}
                className="flex min-h-11 items-center rounded-lg bg-blue-50 px-3 font-semibold text-blue-700 hover:bg-blue-100"
              >
                + {s}
              </Link>
            ))}
          </div>
        </div>

        {registrado === "movimiento" && <p className={mensajeExito}>Movimiento interno registrado.</p>}
        {registrado === "autonomo" && <p className={mensajeExito}>Mantenimiento autónomo registrado.</p>}

        <TarjetasDescargas datos={datos} />

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">
            En mantenimiento <span className="text-slate-500">({enMantenimiento.length})</span>
          </h2>
          {enMantenimiento.length === 0 && <p className="text-slate-600">Ninguna bomba está en mantenimiento.</p>}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {enMantenimiento.map((b) => (
              <div key={b.id} className="flex flex-col gap-2 rounded-xl border-2 border-orange-300 bg-orange-50 p-3">
                <span className="text-lg font-bold">{etiquetaBomba(b.codigo, b.sector)}</span>
                <span className="text-sm text-orange-900">
                  Desde {formatearFechaHora(b.mantenimiento!.desde)}
                  {b.mantenimiento!.motivo && ` · ${b.mantenimiento!.motivo}`}
                </span>
                <AccionMantenimiento bombaId={b.id} codigo={b.codigo} enMantenimiento enUso={false} />
              </div>
            ))}
          </div>
          <AgregarMantenimiento bombasLibres={libres.map((b) => ({ id: b.id, etiqueta: etiquetaBomba(b.codigo, b.sector) }))} />
        </section>
      </main>
    </>
  );
}
