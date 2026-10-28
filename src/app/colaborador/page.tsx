import Link from "next/link";
import { EtiquetaEstado, EtiquetaTipo } from "@/modules/descargas/componentes/EtiquetaEstado";
import { descargasActivas } from "@/modules/descargas/datos";
import { exigirPermiso } from "@/shared/auth/sesion";
import { sectorCorto } from "@/shared/catalogos/sector";
import { formatearFechaHora } from "@/shared/lib/fechas";
import { Encabezado } from "@/shared/ui/Encabezado";
import { botonPrincipal } from "@/shared/ui/estilos";

// Inicio del Colaborador (sección 6.2): descargas en curso y pausadas.
export default async function InicioColaborador() {
  const sesion = await exigirPermiso("descargas.operar");
  const descargas = await descargasActivas();
  const enCurso = descargas.filter((d) => d.estado === "EN_CURSO");
  const pausadas = descargas.filter((d) => d.estado === "PAUSADA");

  return (
    <>
      <Encabezado perfil={sesion.perfil} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
        <Link href="/colaborador/nueva" className={`${botonPrincipal} min-h-16 text-xl`}>
          + Nueva descarga
        </Link>
        <Lista titulo="En curso" descargas={enCurso} vacio="No hay descargas en curso." />
        <Lista titulo="Pausadas" descargas={pausadas} vacio="No hay descargas pausadas." />
      </main>
    </>
  );
}

function Lista({
  titulo,
  descargas,
  vacio,
}: {
  titulo: string;
  descargas: Awaited<ReturnType<typeof descargasActivas>>;
  vacio: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">
        {titulo} <span className="text-slate-500">({descargas.length})</span>
      </h2>
      {descargas.length === 0 && <p className="text-slate-600">{vacio}</p>}
      {descargas.map((d) => {
        const ultimo = d.tramos.at(-1);
        return (
          <Link
            key={d.id}
            href={`/colaborador/descargas/${d.id}`}
            className="flex flex-col gap-2 rounded-xl border-2 border-slate-200 bg-white p-4 hover:border-blue-300 active:bg-slate-50"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-lg font-bold">{d.hojaDeRuta}</span>
              <span className="flex gap-2">
                <EtiquetaTipo tipo={d.tipo} />
                <EtiquetaEstado estado={d.estado} />
              </span>
            </div>
            <span className="text-base">
              {d.producto.nombre} · {d.proveedor.nombre}
            </span>
            <span className="text-sm text-slate-600">
              Tanque {d.tanque.codigo}
              {ultimo && (
                <>
                  {" · "}Bomba {ultimo.bomba.codigo}
                  {ultimo.bomba.descripcion && <span className="text-xs"> ({sectorCorto(ultimo.bomba.descripcion)})</span>}
                  {" · "}
                  {ultimo.fin ? `pausada desde ${formatearFechaHora(ultimo.fin)}` : `desde ${formatearFechaHora(ultimo.inicio)}`}
                </>
              )}
            </span>
          </Link>
        );
      })}
    </section>
  );
}
