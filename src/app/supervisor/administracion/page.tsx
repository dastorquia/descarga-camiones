import Link from "next/link";
import { exigirPermiso } from "@/shared/auth/sesion";
import { CATALOGOS, type Catalogo } from "@/shared/catalogos/validacion";
import { botonSecundario } from "@/shared/ui/estilos";

// Administración (sección 6.7): catálogos, umbrales y PIN.
export default async function Administracion() {
  await exigirPermiso("catalogos.administrar");
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
      <Link href="/supervisor" className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
        ← Volver al tablero
      </Link>
      <h1 className="text-2xl font-bold">Administración</h1>
      {(Object.keys(CATALOGOS) as Catalogo[]).map((c) => (
        <Link key={c} href={`/supervisor/administracion/${c}`} className={botonSecundario}>
          {CATALOGOS[c].titulo}
        </Link>
      ))}
      <Link href="/supervisor/administracion/umbrales" className={botonSecundario}>
        Umbrales (toneladas y alertas)
      </Link>
      <Link href="/supervisor/cambiar-pin" className={botonSecundario}>
        Cambiar PIN
      </Link>
    </main>
  );
}
