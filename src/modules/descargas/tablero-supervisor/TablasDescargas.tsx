import Link from "next/link";
import { formatearFechaHora, formatearHora } from "@/shared/lib/fechas";
import { Celda, TablaDatos } from "@/shared/ui/TablaDatos";
import { TiempoDesde } from "@/shared/ui/TiempoDesde";
import { EtiquetaEstado } from "../componentes/EtiquetaEstado";
import { formatearHoras } from "../dominio/horas";
import { formatearKilos } from "../dominio/toneladas";
import type { TarjetaTablero } from "./tipos";

// Tablas del tablero del Supervisor: en curso y pausadas, y finalizadas de hoy.

const enlaceHoja = "font-bold text-blue-700 underline-offset-2 hover:underline";

type Props = {
  datos: { pendientes: TarjetaTablero[]; enCurso: TarjetaTablero[]; finalizadas: TarjetaTablero[] };
  enAlerta: (t: TarjetaTablero) => boolean;
};

export function TablasDescargas({ datos, enAlerta }: Props) {
  const activas = [...datos.enCurso, ...datos.pendientes];
  return (
    <>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">
          En curso y pausadas <span className="text-slate-500">({activas.length})</span>
        </h2>
        <TablaDatos
          columnas={["Hoja de ruta", "Estado", "Bomba", "Tiempo", "Producto", "Proveedor o cliente", "Tanque"]}
          vacio={activas.length === 0 ? "No hay descargas en curso ni pausadas." : undefined}
        >
          {activas.map((t) => {
            const alerta = enAlerta(t);
            return (
              <tr key={t.id} className={alerta ? "!bg-red-50" : undefined}>
                <Celda>
                  <Link href={`/colaborador/descargas/${t.id}`} className={enlaceHoja}>
                    {t.hojaDeRuta}
                  </Link>
                  {t.tipo === "CARGA" && <span className="ml-2 text-xs font-semibold text-blue-800">CARGA</span>}
                </Celda>
                <Celda>
                  <EtiquetaEstado estado={t.tramoAbiertoDesde ? "EN_CURSO" : "PAUSADA"} />
                </Celda>
                <Celda>{t.bomba ?? "—"}</Celda>
                <Celda>
                  {t.tramoAbiertoDesde ? (
                    <span className={alerta ? "font-semibold text-red-800" : "text-green-800"}>
                      {t.tipo === "CARGA" ? "Cargando" : "Descargando"} hace <TiempoDesde desde={t.tramoAbiertoDesde} />
                    </span>
                  ) : (
                    <span className="text-amber-900">Pausada desde {t.pausadaDesde ? formatearFechaHora(new Date(t.pausadaDesde)) : "—"}</span>
                  )}
                </Celda>
                <Celda>{t.producto}</Celda>
                <Celda>{t.proveedor}</Celda>
                <Celda>{t.tanque}</Celda>
              </tr>
            );
          })}
        </TablaDatos>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">
          Finalizadas hoy <span className="text-slate-500">({datos.finalizadas.length})</span>
        </h2>
        <TablaDatos
          columnas={["Hoja de ruta", "Terminó", "Kilos", "Horas de bomba", "Bomba", "Producto", "Proveedor o cliente"]}
          vacio={datos.finalizadas.length === 0 ? "Todavía no se finalizó ninguna hoy." : undefined}
        >
          {datos.finalizadas.map((t) => (
            <tr key={t.id}>
              <Celda>
                <Link href={`/colaborador/descargas/${t.id}`} className={enlaceHoja}>
                  {t.hojaDeRuta}
                </Link>
              </Celda>
              <Celda>{t.finalizadaA ? formatearHora(new Date(t.finalizadaA)) : "—"}</Celda>
              <Celda className="text-right tabular-nums">{formatearKilos(t.toneladas)}</Celda>
              <Celda className="text-right tabular-nums">{formatearHoras(t.horasBomba)}</Celda>
              <Celda>{t.bomba ?? "—"}</Celda>
              <Celda>{t.producto}</Celda>
              <Celda>{t.proveedor}</Celda>
            </tr>
          ))}
        </TablaDatos>
      </section>
    </>
  );
}
