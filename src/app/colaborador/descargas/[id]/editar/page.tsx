import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EdicionDescarga, type DescargaEditable } from "@/modules/descargas/componentes/EdicionDescarga";
import { bombasOcupadas, detalleDescarga } from "@/modules/descargas/datos";
import { usaVariasBombas } from "@/modules/descargas/dominio/edicion";
import { puede } from "@/shared/auth/perfiles";
import { exigirPermiso } from "@/shared/auth/sesion";
import { catalogosActivos, type Opcion } from "@/shared/catalogos/datos";
import { etiquetaBomba } from "@/shared/catalogos/sector";
import { aDiaHora } from "@/shared/lib/fechas";
import { Encabezado } from "@/shared/ui/Encabezado";

/** Agrega el elemento actual si está desactivado, para poder conservarlo. */
function conActual(lista: Opcion[], id: number, nombre: string): Opcion[] {
  return lista.some((o) => o.id === id) ? lista : [...lista, { id, nombre: `${nombre} (desactivado)` }];
}

// Edición de una descarga y sus tramos (Etapa 5).
export default async function EditarDescarga({ params }: PageProps<"/colaborador/descargas/[id]/editar">) {
  const sesion = await exigirPermiso("descargas.operar");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [d, catalogos, ocupadas] = await Promise.all([detalleDescarga(id), catalogosActivos(), bombasOcupadas()]);
  if (!d) notFound();
  if (d.estado === "FINALIZADA" && !puede(sesion.perfil, "descargas.editarFinalizadas")) {
    redirect(`/colaborador/descargas/${id}`);
  }

  // Bombas y operarios desactivados que siguen en algún tramo.
  let bombas = catalogos.bombas;
  let operarios = catalogos.operarios;
  for (const t of d.tramos) {
    if (!bombas.some((b) => b.id === t.bomba.id)) {
      bombas = [...bombas, { id: t.bomba.id, codigo: `${t.bomba.codigo} (desactivada)`, sector: t.bomba.descripcion }];
    }
    operarios = conActual(operarios, t.operario.id, t.operario.nombre);
  }
  for (const [bombaId, hoja] of ocupadas) if (hoja === d.hojaDeRuta) ocupadas.delete(bombaId);

  const descarga: DescargaEditable = {
    id: d.id,
    estado: d.estado,
    tipo: d.tipo,
    hojaDeRuta: d.hojaDeRuta,
    patente: d.patente ?? "",
    productoId: d.productoId,
    proveedorId: d.proveedorId,
    tanqueId: d.tanqueId,
    observaciones: d.observaciones ?? "",
    toneladas: d.toneladas?.toString() ?? null,
    variasBombas: usaVariasBombas(d.tramos),
    tramos: d.tramos.map((t) => ({
      id: t.id,
      bombaId: t.bomba.id,
      operarioId: t.operario.id,
      inicio: aDiaHora(t.inicio),
      fin: t.fin ? aDiaHora(t.fin) : null,
      toneladas: t.toneladas?.toString() ?? null,
      bomba: etiquetaBomba(t.bomba.codigo, t.bomba.descripcion),
    })),
  };

  return (
    <>
      <Encabezado perfil={sesion.perfil} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
        <div>
          <Link href={`/colaborador/descargas/${id}`} className="inline-flex min-h-11 items-center text-base font-semibold text-blue-700">
            ← Volver a la descarga
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Editar {d.hojaDeRuta}</h1>
          <p className="text-slate-600">Cada parte se guarda por separado. Los cambios quedan registrados.</p>
        </div>
        <EdicionDescarga
          descarga={descarga}
          productos={conActual(catalogos.productos, d.productoId, d.producto.nombre)}
          proveedores={conActual(catalogos.proveedores, d.proveedorId, d.proveedor.nombre)}
          tanques={conActual(catalogos.tanques, d.tanqueId, d.tanque.codigo)}
          bombas={bombas}
          operarios={operarios}
          ocupadas={Object.fromEntries(ocupadas)}
          puedeAsignarToneladas={puede(sesion.perfil, "tramos.asignarToneladas")}
        />
      </main>
    </>
  );
}
