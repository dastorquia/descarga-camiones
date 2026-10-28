import Link from "next/link";
import { datosTablero } from "@/modules/descargas/tablero-supervisor/datos";
import { TableroSupervisor } from "@/modules/descargas/tablero-supervisor/TableroSupervisor";
import { exigirPermiso } from "@/shared/auth/sesion";

// Inicio del Supervisor: menú y tablero (sección 6.5).
// Administración (Etapa 5) y reportes (Etapa 6) se suman al menú en sus etapas.
export default async function InicioSupervisor() {
  await exigirPermiso("tablero.supervisor");
  const datos = await datosTablero();

  const enlace = "flex min-h-11 items-center rounded-lg border-2 border-slate-300 bg-white px-4 font-semibold hover:bg-slate-100";
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6">
      <nav className="flex flex-wrap gap-2">
        <Link href="/colaborador" className={enlace}>
          Descargas por sector
        </Link>
        <Link href="/colaborador/nueva" className={enlace}>
          + Nueva descarga
        </Link>
        <Link href="/supervisor/cambiar-pin" className={enlace}>
          Cambiar PIN
        </Link>
      </nav>
      <TableroSupervisor inicial={datos} />
    </main>
  );
}
