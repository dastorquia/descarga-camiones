import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AccionesDescarga } from "@/modules/descargas/componentes/AccionesDescarga";
import { EtiquetaEstado, EtiquetaTipo } from "@/modules/descargas/componentes/EtiquetaEstado";
import { bombasOcupadas, detalleDescarga } from "@/modules/descargas/datos";
import { formatearHoras, horasBomba, horasTramo } from "@/modules/descargas/dominio/horas";
import { formatearToneladas } from "@/modules/descargas/dominio/toneladas";
import { inicioDe, puede } from "@/shared/auth/perfiles";
import { botonSecundario } from "@/shared/ui/estilos";
import { exigirPermiso } from "@/shared/auth/sesion";
import { catalogosActivos } from "@/shared/catalogos/datos";
import { etiquetaBomba } from "@/shared/catalogos/sector";
import { aDiaHora, formatearFechaHora } from "@/shared/lib/fechas";
import { Encabezado } from "@/shared/ui/Encabezado";

// Detalle de descarga (sección 6.4).
export default async function DetalleDescarga({ params }: PageProps<"/colaborador/descargas/[id]">) {
  const sesion = await exigirPermiso("descargas.operar");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [descarga, catalogos, ocupadas] = await Promise.all([detalleDescarga(id), catalogosActivos(), bombasOcupadas()]);
  if (!descarga) notFound();

  const esCarga = descarga.tipo === "CARGA";
  const primero = descarga.tramos[0];
  const ultimo = descarga.tramos.at(-1);
  const abierto = descarga.tramos.find((t) => t.fin === null);

  return (
    <>
      <Encabezado perfil={sesion.perfil} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
        <div>
          <Link href={inicioDe(sesion.perfil)} className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
            ← Volver
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="mr-auto text-2xl font-bold">{descarga.hojaDeRuta}</h1>
            <EtiquetaTipo tipo={descarga.tipo} />
            <EtiquetaEstado estado={descarga.estado} />
          </div>
        </div>

        <AccionesDescarga
          descargaId={descarga.id}
          estado={descarga.estado}
          diaInicioTramoAbierto={abierto ? aDiaHora(abierto.inicio).dia : null}
          ultimaBombaId={ultimo?.bomba.id ?? null}
          ultimoOperarioId={ultimo?.operario.id ?? null}
          bombas={catalogos.bombas}
          operarios={catalogos.operarios}
          ocupadas={Object.fromEntries(ocupadas)}
        />

        {(descarga.estado !== "FINALIZADA" || puede(sesion.perfil, "descargas.editarFinalizadas")) && (
          <Link href={`/colaborador/descargas/${descarga.id}/editar`} className={botonSecundario}>
            {descarga.estado === "FINALIZADA" ? "Corregir datos" : "Editar datos"}
          </Link>
        )}

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl border-2 border-slate-200 bg-white p-4">
          <Dato nombre="Patente">{descarga.patente ?? "—"}</Dato>
          <Dato nombre="Producto">{descarga.producto.nombre}</Dato>
          <Dato nombre={esCarga ? "Cliente" : "Proveedor"}>{descarga.proveedor.nombre}</Dato>
          <Dato nombre={esCarga ? "Tanque de origen" : "Tanque de destino"}>{descarga.tanque.codigo}</Dato>
          <Dato nombre="Operario de inicio">{primero?.operario.nombre ?? "—"}</Dato>
          <Dato nombre="Horas de bomba">{formatearHoras(horasBomba(descarga.tramos))}</Dato>
          <Dato nombre="Toneladas">{formatearToneladas(descarga.toneladas)}</Dato>
          {descarga.observaciones && <Dato nombre="Observaciones">{descarga.observaciones}</Dato>}
        </dl>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Tramos de bombeo</h2>
          {descarga.tramos.map((t, i) => {
            const horas = horasTramo(t);
            return (
              <div key={t.id} className="flex flex-col gap-1 rounded-xl border-2 border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Tramo {i + 1}</span>
                  <span className={horas === null ? "font-semibold text-green-700" : "font-semibold"}>
                    {horas === null ? "en curso" : formatearHoras(horas)}
                  </span>
                </div>
                <span>
                  Bomba {etiquetaBomba(t.bomba.codigo, t.bomba.descripcion)}
                  {" · "}
                  {t.operario.nombre}
                </span>
                <span className="text-sm text-slate-600">
                  {formatearFechaHora(t.inicio)} → {t.fin ? formatearFechaHora(t.fin) : "…"}
                </span>
                {t.toneladas && (
                  <span className="text-sm">
                    {formatearToneladas(t.toneladas)} <span className="text-amber-800">· asignación manual</span>
                  </span>
                )}
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}

function Dato({ nombre, children }: { nombre: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-slate-600">{nombre}</dt>
      <dd className="font-semibold">{children}</dd>
    </>
  );
}
