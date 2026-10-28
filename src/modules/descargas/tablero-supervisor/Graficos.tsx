import type { ReactNode } from "react";
import { formatearHoras } from "../dominio/horas";
import { mostrarKilos } from "../dominio/toneladas";
import type { GraficosMes } from "./tipos";

// Gráficos del mes en curso (pedido del 29/10/2026): kilos y horas de uso por bomba.
// Barras horizontales, un solo eje por gráfico, total al final de cada barra y
// detalle al pasar el mouse. Paleta validada (azul/naranja, apta para daltonismo).

const COLOR = { descarga: "#2a78d6", carga: "#eb6834" } as const;

type Segmento = { nombre: string; valor: number; color: string };
type Fila = { etiqueta: string; segmentos: Segmento[] };

function Barras({ filas, formato, vacio }: { filas: Fila[]; formato: (n: number) => string; vacio: string }) {
  const total = (f: Fila) => f.segmentos.reduce((s, x) => s + x.valor, 0);
  const maximo = Math.max(0, ...filas.map(total));
  if (maximo === 0) return <p className="py-6 text-center text-slate-600">{vacio}</p>;

  return (
    <ul className="flex flex-col gap-2">
      {filas.map((f) => {
        const t = total(f);
        const conValor = f.segmentos.filter((s) => s.valor > 0);
        return (
          <li key={f.etiqueta} className="group relative grid grid-cols-[6.5rem_1fr] items-center gap-2 text-sm" tabIndex={0}>
            <span className="truncate font-semibold text-slate-700">{f.etiqueta}</span>
            <div className="flex items-center gap-2">
              {/* Pista: el ancho de la barra es proporcional al máximo del gráfico. */}
              <div className="flex h-5 min-w-0 gap-[2px]" style={{ width: `${(t / maximo) * 85}%` }}>
                {conValor.map((s, i) => (
                  <div
                    key={s.nombre}
                    className={i === conValor.length - 1 ? "rounded-r" : ""}
                    style={{ width: `${(s.valor / t) * 100}%`, background: s.color, minWidth: 2 }}
                  />
                ))}
              </div>
              <span className="whitespace-nowrap text-slate-700 tabular-nums">{t > 0 ? formato(t) : "—"}</span>
            </div>
            {/* Detalle al pasar el mouse o al enfocar la fila. */}
            {t > 0 && (
              <div className="pointer-events-none absolute top-full left-28 z-10 mt-1 hidden rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg group-hover:block group-focus:block">
                <strong className="block">{f.etiqueta}</strong>
                {f.segmentos.map((s) => (
                  <span key={s.nombre} className="flex items-center gap-2 whitespace-nowrap">
                    <span className="inline-block size-2.5 rounded-sm" style={{ background: s.color }} />
                    {s.nombre}: {formato(s.valor)}
                  </span>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Leyenda({ items }: { items: { nombre: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-4 text-sm text-slate-700">
      {items.map((i) => (
        <span key={i.nombre} className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm" style={{ background: i.color }} />
          {i.nombre}
        </span>
      ))}
    </div>
  );
}

function Grafico({ titulo, children, tabla }: { titulo: string; children: ReactNode; tabla: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4">
      <h2 className="text-lg font-bold">{titulo}</h2>
      {children}
      <details className="text-sm">
        <summary className="cursor-pointer font-semibold text-blue-700">Ver como tabla</summary>
        <div className="mt-2 overflow-x-auto">{tabla}</div>
      </details>
    </section>
  );
}

export function GraficosDelMes({ datos }: { datos: GraficosMes }) {
  const hayCargas = datos.bombas.some((b) => b.kilosCarga > 0);
  const celda = "border-b border-slate-100 px-2 py-1";
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Grafico
        titulo={`Kilos por bomba · ${datos.mes}`}
        tabla={
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className={celda}>Bomba</th>
                <th className={`${celda} text-right`}>Descarga</th>
                <th className={`${celda} text-right`}>Carga</th>
                <th className={`${celda} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {datos.bombas.map((b) => (
                <tr key={b.id}>
                  <td className={celda}>{b.etiqueta}</td>
                  <td className={`${celda} text-right tabular-nums`}>{mostrarKilos(b.kilosDescarga)}</td>
                  <td className={`${celda} text-right tabular-nums`}>{mostrarKilos(b.kilosCarga)}</td>
                  <td className={`${celda} text-right tabular-nums`}>{mostrarKilos(b.kilosDescarga + b.kilosCarga)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        {hayCargas && (
          <Leyenda
            items={[
              { nombre: "Descarga", color: COLOR.descarga },
              { nombre: "Carga", color: COLOR.carga },
            ]}
          />
        )}
        <Barras
          formato={mostrarKilos}
          vacio="Todavía no hay descargas finalizadas este mes."
          filas={datos.bombas.map((b) => ({
            etiqueta: b.etiqueta,
            segmentos: [
              { nombre: "Descarga", valor: b.kilosDescarga, color: COLOR.descarga },
              { nombre: "Carga", valor: b.kilosCarga, color: COLOR.carga },
            ],
          }))}
        />
        <p className="text-xs text-slate-500">
          Descargas finalizadas en el mes. Con varias bombas en un mismo camión, solo cuentan los kilos asignados por el Supervisor.
        </p>
      </Grafico>

      <Grafico
        titulo={`Horas de uso por bomba · ${datos.mes}`}
        tabla={
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className={celda}>Bomba</th>
                <th className={`${celda} text-right`}>Horas</th>
              </tr>
            </thead>
            <tbody>
              {datos.bombas.map((b) => (
                <tr key={b.id}>
                  <td className={celda}>{b.etiqueta}</td>
                  <td className={`${celda} text-right tabular-nums`}>{formatearHoras(b.horas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <Barras
          formato={formatearHoras}
          vacio="Todavía no hay horas de bomba este mes."
          filas={datos.bombas.map((b) => ({
            etiqueta: b.etiqueta,
            segmentos: [{ nombre: "Horas", valor: b.horas, color: COLOR.descarga }],
          }))}
        />
        <p className="text-xs text-slate-500">Solo tramos terminados. Se reinicia el primer día de cada mes.</p>
      </Grafico>
    </div>
  );
}
