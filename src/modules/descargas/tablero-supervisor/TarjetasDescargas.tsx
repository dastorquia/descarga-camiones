import Link from "next/link";
import type { ReactNode } from "react";
import { formatearFechaHora, formatearHora } from "@/shared/lib/fechas";
import { TiempoDesde } from "@/shared/ui/TiempoDesde";
import { formatearHoras } from "../dominio/horas";
import { formatearKilos } from "../dominio/toneladas";
import type { TarjetaTablero } from "./tipos";

// Tarjetas en tres columnas: Pendientes (pausadas), En curso y Finalizadas hoy.
// Se usan en el inicio del Colaborador.

type Props = {
  datos: { pendientes: TarjetaTablero[]; enCurso: TarjetaTablero[]; finalizadas: TarjetaTablero[] };
  /** Marca en rojo los tramos abiertos hace demasiado (opcional). */
  enAlerta?: (t: TarjetaTablero) => boolean;
};

export function TarjetasDescargas({ datos, enAlerta = () => false }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Columna titulo="Pendientes (pausadas)" cantidad={datos.pendientes.length} vacio="No hay descargas pausadas.">
        {datos.pendientes.map((t) => (
          <Tarjeta key={t.id} t={t}>
            <span className="text-amber-900">Pausada desde {t.pausadaDesde ? formatearFechaHora(new Date(t.pausadaDesde)) : "—"}</span>
            <span className="text-sm text-slate-600">{formatearHoras(t.horasBomba)} de bomba hasta ahora</span>
          </Tarjeta>
        ))}
      </Columna>
      <Columna titulo="En curso" cantidad={datos.enCurso.length} vacio="No hay descargas en curso.">
        {datos.enCurso.map((t) => (
          <Tarjeta key={t.id} t={t} alerta={enAlerta(t)}>
            {t.tramoAbiertoDesde && (
              <span className={enAlerta(t) ? "font-semibold text-red-800" : "text-green-800"}>
                {t.tipo === "CARGA" ? "Cargando" : "Descargando"} hace <TiempoDesde desde={t.tramoAbiertoDesde} />
              </span>
            )}
          </Tarjeta>
        ))}
      </Columna>
      <Columna titulo="Finalizadas hoy" cantidad={datos.finalizadas.length} vacio="Todavía no se finalizó ninguna hoy.">
        {datos.finalizadas.map((t) => (
          <Tarjeta key={t.id} t={t}>
            <span>
              {formatearKilos(t.toneladas)} · {formatearHoras(t.horasBomba)} de bomba
            </span>
            {t.finalizadaA && <span className="text-sm text-slate-600">Terminó {formatearHora(new Date(t.finalizadaA))}</span>}
          </Tarjeta>
        ))}
      </Columna>
    </div>
  );
}

function Columna({ titulo, cantidad, vacio, children }: { titulo: string; cantidad: number; vacio: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-slate-100 p-3">
      <h2 className="px-1 text-lg font-bold">
        {titulo} <span className="text-slate-500">({cantidad})</span>
      </h2>
      {cantidad === 0 && <p className="px-1 text-slate-600">{vacio}</p>}
      {children}
    </section>
  );
}

function Tarjeta({ t, alerta = false, children }: { t: TarjetaTablero; alerta?: boolean; children: ReactNode }) {
  return (
    <Link
      href={`/colaborador/descargas/${t.id}`}
      className={`flex flex-col gap-1 rounded-xl border-2 bg-white p-3 hover:border-blue-300 ${alerta ? "border-red-400" : "border-slate-200"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-lg font-bold">{t.hojaDeRuta}</span>
        <span className="text-sm font-semibold text-blue-800">{t.tipo === "CARGA" ? "Carga" : "Descarga"}</span>
      </div>
      {t.bomba && <span className="font-semibold">Bomba {t.bomba}</span>}
      {children}
      <span className="text-sm text-slate-600">
        {t.producto} · {t.proveedor} · {t.tanque}
      </span>
    </Link>
  );
}
