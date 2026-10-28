import Link from "next/link";
import { EtiquetaEstado } from "@/modules/descargas/componentes/EtiquetaEstado";
import { descargasActivas, descargasFinalizadasHoy } from "@/modules/descargas/datos";
import { formatearHoras, horasBomba } from "@/modules/descargas/dominio/horas";
import { agruparPorSector } from "@/modules/descargas/dominio/tablero";
import { formatearToneladas } from "@/modules/descargas/dominio/toneladas";
import { exigirPermiso } from "@/shared/auth/sesion";
import { catalogosActivos } from "@/shared/catalogos/datos";
import { etiquetaBomba, sectorCorto } from "@/shared/catalogos/sector";
import { formatearFechaHora, formatearHora } from "@/shared/lib/fechas";
import { Actualizador } from "@/shared/ui/Actualizador";
import { Encabezado } from "@/shared/ui/Encabezado";
import { botonPrincipal } from "@/shared/ui/estilos";
import { TiempoDesde } from "@/shared/ui/TiempoDesde";

type Activa = Awaited<ReturnType<typeof descargasActivas>>[number];
type Finalizada = Awaited<ReturnType<typeof descargasFinalizadasHoy>>[number];

// Tablero de inicio (sección 6.2): qué hay en cada sector de descarga, qué
// bomba se usa y hace cuánto, más las finalizadas de hoy.
export default async function TableroColaborador() {
  const sesion = await exigirPermiso("descargas.operar");
  const [activas, finalizadas, catalogos] = await Promise.all([
    descargasActivas(),
    descargasFinalizadasHoy(),
    catalogosActivos(),
  ]);
  const sectores = [...new Set(catalogos.bombas.map((b) => b.sector).filter((s): s is string => s !== null))];
  const grupos = agruparPorSector(sectores, activas);

  return (
    <>
      <Encabezado perfil={sesion.perfil} />
      {/* El Supervisor tendrá su propio tablero con actualización (Etapa 4); acá se
          actualiza solo para el Colaborador, para no mantener viva la sesión del Supervisor. */}
      {sesion.perfil === "COLABORADOR" && <Actualizador segundos={30} />}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6">
        <Link href="/colaborador/nueva" className={`${botonPrincipal} min-h-16 text-xl md:max-w-sm`}>
          + Nueva descarga
        </Link>

        <div className="grid gap-4 md:grid-cols-3">
          {grupos.map((g) => (
            <Sector key={g.sector} sector={g.sector} descargas={g.descargas} conAlta={sectores.includes(g.sector)} />
          ))}
        </div>

        <Finalizadas descargas={finalizadas} />
      </main>
    </>
  );
}

function Sector({ sector, descargas, conAlta }: { sector: string; descargas: Activa[]; conAlta: boolean }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">
          {sector} <span className="text-sm font-semibold text-slate-500">{sectorCorto(sector)}</span>
        </h2>
        {conAlta && (
          <Link
            href={`/colaborador/nueva?sector=${encodeURIComponent(sector)}`}
            className="flex min-h-11 items-center rounded-lg bg-blue-50 px-3 text-base font-semibold text-blue-700 hover:bg-blue-100"
          >
            + Agregar
          </Link>
        )}
      </div>

      {descargas.length === 0 && <p className="rounded-xl bg-slate-50 px-3 py-4 text-slate-600">Libre, sin camiones.</p>}

      {descargas.map((d) => {
        const ultimo = d.tramos.at(-1);
        const verbo = d.tipo === "CARGA" ? "Cargando" : "Descargando";
        return (
          <Link
            key={d.id}
            href={`/colaborador/descargas/${d.id}`}
            className="flex flex-col gap-1 rounded-xl border-2 border-slate-200 p-3 hover:border-blue-300 active:bg-slate-50"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg font-bold">{d.hojaDeRuta}</span>
              <EtiquetaEstado estado={d.estado} />
            </div>
            {ultimo && (
              <span className="font-semibold">Bomba {etiquetaBomba(ultimo.bomba.codigo, ultimo.bomba.descripcion)}</span>
            )}
            {ultimo && !ultimo.fin && (
              <span className="text-green-800">
                {verbo} hace <TiempoDesde desde={ultimo.inicio.toISOString()} />
              </span>
            )}
            {ultimo?.fin && <span className="text-amber-900">Pausada desde {formatearFechaHora(ultimo.fin)}</span>}
            <span className="text-sm text-slate-600">
              {d.producto.nombre} · {d.proveedor.nombre} · {d.tanque.codigo}
            </span>
          </Link>
        );
      })}
    </section>
  );
}

function Finalizadas({ descargas }: { descargas: Finalizada[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">
        Finalizadas hoy <span className="text-slate-500">({descargas.length})</span>
      </h2>
      {descargas.length === 0 && <p className="text-slate-600">Todavía no se finalizó ninguna hoy.</p>}
      <div className="grid gap-3 md:grid-cols-3">
        {descargas.map((d) => {
          const fin = d.tramos.at(-1)?.fin;
          return (
            <Link
              key={d.id}
              href={`/colaborador/descargas/${d.id}`}
              className="flex flex-col gap-1 rounded-xl border-2 border-slate-200 bg-white p-3 hover:border-blue-300 active:bg-slate-50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-bold">{d.hojaDeRuta}</span>
                {fin && <span className="text-sm text-slate-600">terminó {formatearHora(fin)}</span>}
              </div>
              <span>
                {formatearToneladas(d.toneladas)} · {formatearHoras(horasBomba(d.tramos))} de bomba
              </span>
              <span className="text-sm text-slate-600">
                {d.producto.nombre} · {d.proveedor.nombre}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
