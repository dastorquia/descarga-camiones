import Link from "next/link";
import { formatearHoras } from "@/modules/descargas/dominio/horas";
import { formatearKilos } from "@/modules/descargas/dominio/toneladas";
import { movimientosDelPeriodo } from "@/modules/movimientos/datos";
import { exigirPermiso } from "@/shared/auth/sesion";
import { etiquetaBomba } from "@/shared/catalogos/sector";
import { aDiaHora, desdeDiaHora, formatearFechaHora } from "@/shared/lib/fechas";
import { Celda, TablaDatos } from "@/shared/ui/TablaDatos";

// Movimientos internos del mes (por defecto, el mes en curso).
export default async function Movimientos({ searchParams }: PageProps<"/supervisor/movimientos">) {
  await exigirPermiso("reportes.ver");
  const pedido = (await searchParams).mes;
  const mes = typeof pedido === "string" && /^\d{4}-\d{2}$/.test(pedido) ? pedido : aDiaHora(new Date()).dia.slice(0, 7);
  const [anio, m] = mes.split("-").map(Number) as [number, number];
  const siguiente = m === 12 ? `${anio + 1}-01` : `${anio}-${String(m + 1).padStart(2, "0")}`;
  const movimientos = await movimientosDelPeriodo({
    desde: desdeDiaHora(`${mes}-01`, "00:00")!,
    hasta: desdeDiaHora(`${siguiente}-01`, "00:00")!,
  });

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6">
      <Link href="/supervisor" className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
        ← Volver al tablero
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">Movimientos internos</h1>
        <form className="flex items-end gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Mes</span>
            <input type="month" name="mes" defaultValue={mes} className="min-h-11 rounded-lg border-2 border-slate-300 px-2" />
          </label>
          <button type="submit" className="min-h-11 rounded-lg bg-blue-700 px-4 font-semibold text-white">
            Ver
          </button>
        </form>
      </div>
      <TablaDatos
        columnas={["Inicio", "Fin", "Horas", "Origen", "Destino", "Kilos", "Patente", "Bomba de carga", "Bomba de descarga", "Colaborador"]}
        vacio={movimientos.length === 0 ? "No hay movimientos internos en este mes." : undefined}
      >
        {movimientos.map((x) => (
          <tr key={x.id}>
            <Celda>{formatearFechaHora(x.inicio)}</Celda>
            <Celda>{formatearFechaHora(x.fin)}</Celda>
            <Celda className="text-right tabular-nums">{formatearHoras((x.fin.getTime() - x.inicio.getTime()) / 3_600_000)}</Celda>
            <Celda>{x.tanqueOrigen.codigo}</Celda>
            <Celda>{x.tanqueDestino.codigo}</Celda>
            <Celda className="text-right tabular-nums">{formatearKilos(x.toneladas)}</Celda>
            <Celda>{x.patente}</Celda>
            <Celda>{etiquetaBomba(x.bombaCarga.codigo, x.bombaCarga.descripcion)}</Celda>
            <Celda>{etiquetaBomba(x.bombaDescarga.codigo, x.bombaDescarga.descripcion)}</Celda>
            <Celda>{x.operario.nombre}</Celda>
          </tr>
        ))}
      </TablaDatos>
    </main>
  );
}
