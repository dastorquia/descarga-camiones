import Link from "next/link";
import { exigirPermiso } from "@/shared/auth/sesion";
import { leerUmbrales } from "@/shared/config/leer";
import { FormularioUmbrales } from "./FormularioUmbrales";

export default async function Umbrales() {
  await exigirPermiso("configuracion.administrar");
  const actuales = await leerUmbrales();
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
      <Link href="/supervisor/administracion" className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
        ← Volver a Administración
      </Link>
      <h1 className="text-2xl font-bold">Umbrales</h1>
      <FormularioUmbrales actuales={actuales} />
    </main>
  );
}
