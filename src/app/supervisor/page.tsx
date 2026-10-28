import Link from "next/link";
import { exigirPermiso } from "@/shared/auth/sesion";
import { botonSecundario } from "@/shared/ui/estilos";

// Menú del Supervisor. El tablero llega en la Etapa 4; administración en la 5; reportes en la 6.
export default async function InicioSupervisor() {
  await exigirPermiso("pin.cambiar");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-bold">Menú del Supervisor</h1>
      <Link href="/colaborador" className={botonSecundario}>
        Descargas
      </Link>
      <Link href="/supervisor/cambiar-pin" className={botonSecundario}>
        Cambiar PIN
      </Link>
    </main>
  );
}
