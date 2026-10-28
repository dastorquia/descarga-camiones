import type { ReactNode } from "react";

// Tabla tipo hoja de datos: encabezado fijo, filas rayadas y desplazamiento
// horizontal en el celular cuando no entra a lo ancho.

export function TablaDatos({ columnas, children, vacio }: { columnas: string[]; children: ReactNode; vacio?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white">
      <table className="w-full border-collapse text-sm sm:text-base">
        <thead className="bg-slate-100 text-left">
          <tr>
            {columnas.map((c) => (
              <th key={c} className="border-b-2 border-slate-200 px-3 py-2 font-semibold whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:nth-child(even)]:bg-slate-50">{children}</tbody>
      </table>
      {vacio && <p className="px-3 py-4 text-slate-600">{vacio}</p>}
    </div>
  );
}

export function Celda({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`border-b border-slate-100 px-3 py-2 align-middle whitespace-nowrap ${className}`}>{children}</td>;
}
