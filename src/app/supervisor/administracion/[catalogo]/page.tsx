import Link from "next/link";
import { notFound } from "next/navigation";
import { TildeAutonomo } from "@/modules/autonomo/TildeAutonomo";
import { exigirPermiso } from "@/shared/auth/sesion";
import { etiquetaBomba } from "@/shared/catalogos/sector";
import { db } from "@/shared/lib/db";
import { AdminCatalogo } from "@/shared/catalogos/AdminCatalogo";
import { listarCatalogo } from "@/shared/catalogos/admin";
import { CATALOGOS, esCatalogo } from "@/shared/catalogos/validacion";

export default async function PaginaCatalogo({ params }: PageProps<"/supervisor/administracion/[catalogo]">) {
  await exigirPermiso("catalogos.administrar");
  const { catalogo } = await params;
  if (!esCatalogo(catalogo)) notFound();

  const [items, autonomos] = await Promise.all([listarCatalogo(catalogo), catalogo === "bombas" ? db.bombaAutonomo.findMany() : []]);
  const conAutonomo = new Set(autonomos.map((a) => a.bombaId));
  const sectores =
    catalogo === "bombas" ? [...new Set(items.map((i) => i.sector).filter((s): s is string => !!s))].sort() : [];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6">
      <Link href="/supervisor/administracion" className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
        ← Volver a Administración
      </Link>
      <h1 className="text-2xl font-bold">{CATALOGOS[catalogo].titulo}</h1>
      <AdminCatalogo catalogo={catalogo} items={items} sectores={sectores} />
      {catalogo === "bombas" && (
        <section className="flex flex-col gap-2 rounded-2xl border-2 border-slate-200 bg-white p-4">
          <h2 className="text-lg font-bold">Requieren mantenimiento autónomo</h2>
          <p className="text-sm text-slate-600">Marcá las bombas en las que los colaboradores registran las 4 tareas de mantenimiento autónomo.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {items
              .filter((i) => i.activo)
              .map((i) => (
                <TildeAutonomo key={i.id} bombaId={i.id} etiqueta={etiquetaBomba(i.valor, i.sector)} requiere={conAutonomo.has(i.id)} />
              ))}
          </div>
        </section>
      )}
    </main>
  );
}
