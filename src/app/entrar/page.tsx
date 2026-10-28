import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/shared/auth/sesion";
import { TecladoPin } from "./TecladoPin";

// Entrada del Supervisor con teclado numérico (sección 6.1).
export default async function EntrarSupervisor() {
  const sesion = await obtenerSesion();
  if (sesion?.perfil === "SUPERVISOR") redirect("/supervisor");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div>
        <Link href="/" className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
          ← Volver
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Supervisor</h1>
      </div>
      <TecladoPin />
    </main>
  );
}
