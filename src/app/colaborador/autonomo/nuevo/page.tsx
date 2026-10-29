import Link from "next/link";
import { bombasConAutonomo } from "@/modules/autonomo/datos";
import { FormularioTarea } from "@/modules/autonomo/FormularioTarea";
import { exigirPermiso } from "@/shared/auth/sesion";
import { catalogosActivos } from "@/shared/catalogos/datos";
import { Encabezado } from "@/shared/ui/Encabezado";

// Registro de mantenimiento autónomo (sección 13, 29/10/2026).
export default async function NuevaTareaAutonoma() {
  const sesion = await exigirPermiso("descargas.operar");
  const [bombas, catalogos] = await Promise.all([bombasConAutonomo(), catalogosActivos()]);
  return (
    <>
      <Encabezado perfil={sesion.perfil} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
        <div>
          <Link href="/colaborador" className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
            ← Volver
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Mantenimiento autónomo</h1>
        </div>
        <FormularioTarea bombas={bombas} operarios={catalogos.operarios} />
      </main>
    </>
  );
}
