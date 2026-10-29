import Link from "next/link";
import { AccionMantenimiento } from "@/modules/descargas/componentes/AccionMantenimiento";
import { EtiquetaEstado } from "@/modules/descargas/componentes/EtiquetaEstado";
import { descargasActivas, descargasFinalizadasHoy, estadoBombasActual } from "@/modules/descargas/datos";
import { formatearHoras, horasBomba } from "@/modules/descargas/dominio/horas";
import { sectorDe, SIN_SECTOR } from "@/modules/descargas/dominio/tablero";
import { formatearKilos } from "@/modules/descargas/dominio/toneladas";
import { exigirPermiso } from "@/shared/auth/sesion";
import { etiquetaBomba, sectorCorto } from "@/shared/catalogos/sector";
import { formatearFechaHora, formatearHora } from "@/shared/lib/fechas";
import { Actualizador } from "@/shared/ui/Actualizador";
import { Encabezado } from "@/shared/ui/Encabezado";
import { botonPrincipal, botonSecundario } from "@/shared/ui/estilos";
import { Celda, TablaDatos } from "@/shared/ui/TablaDatos";
import { TiempoDesde } from "@/shared/ui/TiempoDesde";

const enlaceHoja = "font-bold text-blue-700 underline-offset-2 hover:underline";

// Inicio del Colaborador (sección 6.2 y 13): hojas de datos con las descargas en curso
// y pausadas, el estado de las bombas (con mantenimiento) y las finalizadas de hoy.
export default async function TableroColaborador() {
  const sesion = await exigirPermiso("descargas.operar");
  const [activas, finalizadas, bombas] = await Promise.all([descargasActivas(), descargasFinalizadasHoy(), estadoBombasActual()]);
  const sectores = [...new Set(bombas.map((b) => b.sector).filter((s): s is string => s !== null))].sort();

  // Ordenadas por sector y, dentro del sector, la más antigua primero.
  const orden = (s: string) => (s === SIN_SECTOR ? "~" : s);
  const filas = [...activas].sort(
    (a, b) => orden(sectorDe(a)).localeCompare(orden(sectorDe(b))) || a.tramos[0]!.inicio.getTime() - b.tramos[0]!.inicio.getTime(),
  );

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

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">
            En curso y pausadas <span className="text-slate-500">({activas.length})</span>
          </h2>
          <TablaDatos
            columnas={["Sector", "Hoja de ruta", "Estado", "Bomba", "Tiempo", "Producto", "Proveedor o cliente", "Tanque"]}
            vacio={activas.length === 0 ? "No hay descargas en curso ni pausadas." : undefined}
          >
            {filas.map((d) => {
              const ultimo = d.tramos.at(-1);
              const verbo = d.tipo === "CARGA" ? "Cargando" : "Descargando";
              return (
                <tr key={d.id}>
                  <Celda className="font-semibold">{sectorCorto(sectorDe(d)) ?? "—"}</Celda>
                  <Celda>
                    <Link href={`/colaborador/descargas/${d.id}`} className={enlaceHoja}>
                      {d.hojaDeRuta}
                    </Link>
                    {d.tipo === "CARGA" && <span className="ml-2 text-xs font-semibold text-blue-800">CARGA</span>}
                  </Celda>
                  <Celda>
                    <EtiquetaEstado estado={d.estado} />
                  </Celda>
                  <Celda>{ultimo ? etiquetaBomba(ultimo.bomba.codigo, ultimo.bomba.descripcion) : "—"}</Celda>
                  <Celda>
                    {ultimo && !ultimo.fin && (
                      <span className="text-green-800">
                        {verbo} hace <TiempoDesde desde={ultimo.inicio.toISOString()} />
                      </span>
                    )}
                    {ultimo?.fin && <span className="text-amber-900">Pausada desde {formatearFechaHora(ultimo.fin)}</span>}
                  </Celda>
                  <Celda>{d.producto.nombre}</Celda>
                  <Celda>{d.proveedor.nombre}</Celda>
                  <Celda>{d.tanque.codigo}</Celda>
                </tr>
              );
            })}
          </TablaDatos>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Bombas</h2>
          <TablaDatos columnas={["Bomba", "Estado"]}>
            {bombas.map((b) => (
              <tr key={b.id} className={b.mantenimiento ? "!bg-orange-50" : undefined}>
                <Celda className="font-semibold">{etiquetaBomba(b.codigo, b.sector)}</Celda>
                {/* Estado y botón en la misma celda: así la tabla entra en el celular. */}
                <Celda className="w-full !whitespace-normal">
                  <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                    {b.mantenimiento ? (
                      <span className="font-semibold text-orange-800">
                        En mantenimiento desde {formatearFechaHora(b.mantenimiento.desde)}
                        {b.mantenimiento.motivo && <span className="font-normal"> · {b.mantenimiento.motivo}</span>}
                      </span>
                    ) : b.ocupadaPor ? (
                      <span className="text-green-800">
                        En uso ·{" "}
                        <Link href={`/colaborador/descargas/${b.ocupadaPor.descargaId}`} className={enlaceHoja}>
                          {b.ocupadaPor.hojaDeRuta}
                        </Link>
                      </span>
                    ) : (
                      <span className="text-slate-600">Libre</span>
                    )}
                    {!b.ocupadaPor && (
                      <AccionMantenimiento bombaId={b.id} codigo={b.codigo} enMantenimiento={!!b.mantenimiento} enUso={false} />
                    )}
                  </div>
                </Celda>
              </tr>
            ))}
          </TablaDatos>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">
            Finalizadas hoy <span className="text-slate-500">({finalizadas.length})</span>
          </h2>
          <TablaDatos
            columnas={["Hoja de ruta", "Terminó", "Kilos", "Horas de bomba", "Bomba", "Producto", "Proveedor o cliente"]}
            vacio={finalizadas.length === 0 ? "Todavía no se finalizó ninguna hoy." : undefined}
          >
            {finalizadas.map((d) => {
              const fin = d.tramos.at(-1)?.fin;
              const bombasUsadas = [...new Set(d.tramos.map((t) => etiquetaBomba(t.bomba.codigo, t.bomba.descripcion)))];
              return (
                <tr key={d.id}>
                  <Celda>
                    <Link href={`/colaborador/descargas/${d.id}`} className={enlaceHoja}>
                      {d.hojaDeRuta}
                    </Link>
                  </Celda>
                  <Celda>{fin ? formatearHora(fin) : "—"}</Celda>
                  <Celda className="text-right tabular-nums">{formatearKilos(d.toneladas)}</Celda>
                  <Celda className="text-right tabular-nums">{formatearHoras(horasBomba(d.tramos))}</Celda>
                  <Celda>{bombasUsadas.join(", ")}</Celda>
                  <Celda>{d.producto.nombre}</Celda>
                  <Celda>{d.proveedor.nombre}</Celda>
                </tr>
              );
            })}
          </TablaDatos>
        </section>
      </main>
    </>
  );
}
