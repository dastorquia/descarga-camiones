"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ENCABEZADO_AUTOMATICO } from "@/shared/auth/cookie";
import { formatearFechaHora, formatearHoraConSegundos } from "@/shared/lib/fechas";
import { useAhora } from "@/shared/ui/reloj";
import { TiempoDesde } from "@/shared/ui/TiempoDesde";
import { tramoEnAlerta } from "../dominio/tablero";
import { GraficosDelMes } from "./Graficos";
import { TablasDescargas } from "./TablasDescargas";
import type { DatosTablero, TarjetaTablero } from "./tipos";

const ACTUALIZAR_CADA_MS = 20_000;

// Tablero del Supervisor (sección 6.5), pensado para la computadora.
export function TableroSupervisor({ inicial }: { inicial: DatosTablero }) {
  const [datos, setDatos] = useState(inicial);
  const [sinConexion, setSinConexion] = useState(false);
  const ahora = useAhora();
  const router = useRouter();

  useEffect(() => {
    async function actualizar() {
      if (document.visibilityState !== "visible") return;
      try {
        const respuesta = await fetch("/api/supervisor/tablero", {
          headers: { [ENCABEZADO_AUTOMATICO]: "1" },
          cache: "no-store",
        });
        if (respuesta.status === 401 || respuesta.status === 403) {
          router.replace("/?motivo=vencida");
          return;
        }
        if (!respuesta.ok) throw new Error(String(respuesta.status));
        setDatos(await respuesta.json());
        setSinConexion(false);
      } catch {
        setSinConexion(true);
      }
    }
    const id = setInterval(actualizar, ACTUALIZAR_CADA_MS);
    return () => clearInterval(id);
  }, [router]);

  const enAlerta = (t: TarjetaTablero) =>
    ahora !== null && t.tramoAbiertoDesde !== null && tramoEnAlerta(new Date(t.tramoAbiertoDesde), new Date(ahora), datos.horasAlerta);
  const alertas = datos.enCurso.filter(enAlerta);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Tablero</h1>
        <span className={`text-sm ${sinConexion ? "font-semibold text-red-700" : "text-slate-500"}`}>
          {sinConexion ? "Sin conexión. Reintentando…" : `Actualizado ${formatearHoraConSegundos(new Date(datos.generado))} · se actualiza solo`}
        </span>
      </div>

      {alertas.length > 0 && (
        <div role="alert" className="flex flex-col gap-2 rounded-2xl border-2 border-red-400 bg-red-50 p-4 text-red-900">
          <strong className="text-lg">
            {alertas.length === 1 ? "1 tramo abierto" : `${alertas.length} tramos abiertos`} hace más de {datos.horasAlerta} h.
            ¿Se olvidaron de pausar o finalizar?
          </strong>
          {alertas.map((t) => (
            <Link key={t.id} href={`/colaborador/descargas/${t.id}`} className="underline">
              {t.hojaDeRuta} · Bomba {t.bomba} · abierto hace <TiempoDesde desde={t.tramoAbiertoDesde!} />
            </Link>
          ))}
        </div>
      )}

      <TablasDescargas datos={datos} enAlerta={enAlerta} />

      <Panel titulo="Bombas">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {datos.bombas.map((b) => {
            const ocupada = b.ocupadaPor;
            const roja = ocupada !== null && ahora !== null && tramoEnAlerta(new Date(ocupada.desde), new Date(ahora), datos.horasAlerta);
            const color = roja
              ? "border-red-400 bg-red-50"
              : b.mantenimiento
                ? "border-orange-400 bg-orange-50"
                : ocupada
                  ? "border-green-300 bg-green-50"
                  : "border-slate-200 bg-white";
            return (
              <li key={b.id} className={`flex flex-col rounded-xl border-2 px-3 py-2 ${color}`}>
                <span className="font-bold">{b.etiqueta}</span>
                {b.mantenimiento ? (
                  <span className="text-sm font-semibold text-orange-900">
                    En mantenimiento desde {formatearFechaHora(new Date(b.mantenimiento.desde))}
                    {b.mantenimiento.motivo && <span className="block font-normal">{b.mantenimiento.motivo}</span>}
                  </span>
                ) : ocupada ? (
                  <Link href={`/colaborador/descargas/${ocupada.descargaId}`} className="text-sm hover:underline">
                    Ocupada · {ocupada.hojaDeRuta} · hace <TiempoDesde desde={ocupada.desde} />
                  </Link>
                ) : (
                  <span className="text-sm text-slate-600">Libre</span>
                )}
              </li>
            );
          })}
        </ul>
      </Panel>

      <GraficosDelMes datos={datos.graficos} />
    </div>
  );
}

function Panel({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border-2 border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-bold">{titulo}</h2>
      {children}
    </section>
  );
}
