import Link from "next/link";
import { FormularioNuevaDescarga } from "@/modules/descargas/componentes/FormularioNuevaDescarga";
import { bombasOcupadas } from "@/modules/descargas/datos";
import { exigirPermiso } from "@/shared/auth/sesion";
import { catalogosActivos } from "@/shared/catalogos/datos";
import { Encabezado } from "@/shared/ui/Encabezado";

// Formulario de nueva descarga (sección 6.3). Con ?sector=Descarga 1 ofrece las bombas de ese sector.
export default async function NuevaDescarga({ searchParams }: PageProps<"/colaborador/nueva">) {
  const sesion = await exigirPermiso("descargas.operar");
  const [catalogos, ocupadas, parametros] = await Promise.all([catalogosActivos(), bombasOcupadas(), searchParams]);
  const pedido = typeof parametros.sector === "string" ? parametros.sector : null;
  const sector = catalogos.bombas.some((b) => b.sector === pedido) ? pedido : null;

  return (
    <>
      <Encabezado perfil={sesion.perfil} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
        <div>
          <Link href="/colaborador" className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
            ← Volver
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Nueva descarga{sector ? ` · ${sector}` : ""}</h1>
        </div>
        <FormularioNuevaDescarga {...catalogos} ocupadas={Object.fromEntries(ocupadas)} sector={sector} />
      </main>
    </>
  );
}
