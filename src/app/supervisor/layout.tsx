import Link from "next/link";
import { usaPinPorDefecto } from "@/shared/auth/pin";
import { exigirPermiso } from "@/shared/auth/sesion";
import { Encabezado } from "@/shared/ui/Encabezado";
import { mensajeAviso } from "@/shared/ui/estilos";

export default async function LayoutSupervisor({ children }: LayoutProps<"/supervisor">) {
  const sesion = await exigirPermiso("pin.cambiar");
  const pinPorDefecto = await usaPinPorDefecto();

  return (
    <>
      <Encabezado perfil={sesion.perfil} />
      {pinPorDefecto && (
        <div className="mx-auto w-full max-w-5xl px-4 pt-4">
          <p className={mensajeAviso}>
            Estás usando el PIN por defecto. Cambialo desde el menú:{" "}
            <Link href="/supervisor/cambiar-pin" className="font-semibold underline">
              Cambiar PIN
            </Link>
            .
          </p>
        </div>
      )}
      {children}
    </>
  );
}
