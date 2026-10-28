import { exigirPermiso } from "@/shared/auth/sesion";
import { Encabezado } from "@/shared/ui/Encabezado";

// Inicio del Colaborador. La lista de descargas y "Nueva descarga" llegan en la Etapa 3.
export default async function InicioColaborador() {
  const sesion = await exigirPermiso("descargas.operar");

  return (
    <>
      <Encabezado perfil={sesion.perfil} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
        <h1 className="text-2xl font-bold">Descargas</h1>
        <p className="text-lg text-slate-600">Acá vas a ver las descargas en curso y pausadas.</p>
      </main>
    </>
  );
}
