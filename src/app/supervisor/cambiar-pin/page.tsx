import Link from "next/link";
import { exigirPermiso } from "@/shared/auth/sesion";
import { FormularioCambioPin } from "./FormularioCambioPin";

export default async function CambiarPin() {
  await exigirPermiso("pin.cambiar");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
      <div>
        <Link href="/supervisor" className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
          ← Volver al menú
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Cambiar PIN</h1>
      </div>
      <FormularioCambioPin />
    </main>
  );
}
