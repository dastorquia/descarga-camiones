import Link from "next/link";
import { redirect } from "next/navigation";
import { entrarComoColaborador } from "@/shared/auth/acciones";
import { inicioDe } from "@/shared/auth/perfiles";
import { obtenerSesion } from "@/shared/auth/sesion";
import { botonPrincipal, botonSecundario, mensajeAviso } from "@/shared/ui/estilos";

// Pantalla de verificación (sección 6.1): dos botones grandes.
export default async function Verificacion({ searchParams }: PageProps<"/">) {
  const sesion = await obtenerSesion();
  if (sesion) redirect(inicioDe(sesion.perfil));

  const { motivo } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">Carga y descarga de camiones</h1>
        <p className="mt-2 text-lg text-slate-600">¿Cómo querés entrar?</p>
      </div>

      {motivo === "vencida" && (
        <p className={mensajeAviso}>
          Tu sesión de Supervisor se cerró por inactividad. Ingresá el PIN de nuevo.
        </p>
      )}

      <form action={entrarComoColaborador}>
        <button type="submit" className={`${botonPrincipal} min-h-24 text-2xl`}>
          Colaborador
        </button>
      </form>
      <Link href="/entrar" className={`${botonSecundario} min-h-24 text-2xl`}>
        Supervisor
      </Link>
    </main>
  );
}
