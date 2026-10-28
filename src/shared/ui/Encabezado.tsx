import Link from "next/link";
import { salir } from "@/shared/auth/acciones";
import { NOMBRE_PERFIL, inicioDe, type Perfil } from "@/shared/auth/perfiles";

export function Encabezado({ perfil }: { perfil: Perfil }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href={inicioDe(perfil)} className="text-lg font-bold">
          Camiones
        </Link>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {NOMBRE_PERFIL[perfil]}
          </span>
          <form action={salir}>
            <button type="submit" className="min-h-11 rounded-lg px-3 text-base font-semibold text-blue-700 hover:bg-blue-50">
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
