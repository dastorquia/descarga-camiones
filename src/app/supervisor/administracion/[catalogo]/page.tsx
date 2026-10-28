import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirPermiso } from "@/shared/auth/sesion";
import { AdminCatalogo } from "@/shared/catalogos/AdminCatalogo";
import { listarCatalogo } from "@/shared/catalogos/admin";
import { CATALOGOS, esCatalogo } from "@/shared/catalogos/validacion";

export default async function PaginaCatalogo({ params }: PageProps<"/supervisor/administracion/[catalogo]">) {
  await exigirPermiso("catalogos.administrar");
  const { catalogo } = await params;
  if (!esCatalogo(catalogo)) notFound();

  const items = await listarCatalogo(catalogo);
  const sectores =
    catalogo === "bombas" ? [...new Set(items.map((i) => i.sector).filter((s): s is string => !!s))].sort() : [];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6">
      <Link href="/supervisor/administracion" className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
        ← Volver a Administración
      </Link>
      <h1 className="text-2xl font-bold">{CATALOGOS[catalogo].titulo}</h1>
      <AdminCatalogo catalogo={catalogo} items={items} sectores={sectores} />
    </main>
  );
}
