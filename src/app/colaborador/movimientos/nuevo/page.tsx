import Link from "next/link";
import { FormularioMovimiento } from "@/modules/movimientos/FormularioMovimiento";
import { exigirPermiso } from "@/shared/auth/sesion";
import { catalogosActivos } from "@/shared/catalogos/datos";
import { Encabezado } from "@/shared/ui/Encabezado";

// Nuevo movimiento interno entre tanques (sección 13, 29/10/2026).
export default async function NuevoMovimiento() {
  const sesion = await exigirPermiso("descargas.operar");
  const catalogos = await catalogosActivos();
  return (
    <>
      <Encabezado perfil={sesion.perfil} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
        <div>
          <Link href="/colaborador" className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
            ← Volver
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Nuevo movimiento interno</h1>
        </div>
        <FormularioMovimiento tanques={catalogos.tanques} bombas={catalogos.bombas} operarios={catalogos.operarios} />
      </main>
    </>
  );
}
