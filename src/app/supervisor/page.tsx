import Link from "next/link";
import { datosTablero } from "@/modules/descargas/tablero-supervisor/datos";
import { TableroSupervisor } from "@/modules/descargas/tablero-supervisor/TableroSupervisor";
import { exigirPermiso } from "@/shared/auth/sesion";

// Inicio del Supervisor: menú y tablero (sección 6.5).
export default async function InicioSupervisor() {
  await exigirPermiso("tablero.supervisor");
  const datos = await datosTablero();

  const enlace = "flex min-h-11 items-center rounded-lg border-2 border-slate-300 bg-white px-4 font-semibold hover:bg-slate-100";
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6">
      <nav className="flex flex-wrap gap-2">
        <Link href="/colaborador/nueva" className={enlace}>
          + Nueva descarga
        </Link>
        <Link href="/colaborador/historial" className={enlace}>
          Historial
        </Link>
        <Link href="/supervisor/movimientos" className={enlace}>
          Movimientos
        </Link>
        <Link href="/supervisor/autonomo" className={enlace}>
          Mant. autónomo
        </Link>
        <Link href="/supervisor/reportes" className={enlace}>
          Reportes
        </Link>
        <Link href="/supervisor/administracion" className={enlace}>
          Administración
        </Link>
      </nav>
      <TableroSupervisor inicial={datos} />
    </main>
  );
}
