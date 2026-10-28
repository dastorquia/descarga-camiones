"use client";

import { useState } from "react";
import { sectorCorto } from "@/shared/catalogos/sector";
import type { Opcion, OpcionBomba } from "@/shared/catalogos/datos";
import { aDiaHora } from "@/shared/lib/fechas";
import { AreaTexto, Campo, DiaHora, Desplegable, Texto } from "@/shared/ui/campos";
import { botonPrincipal, botonSecundario, mensajeError } from "@/shared/ui/estilos";
import { useFormulario } from "@/shared/ui/useFormulario";
import { iniciarDescarga, type EstadoAccion } from "../acciones";

type Tipo = "DESCARGA" | "CARGA";

type Props = {
  productos: Opcion[];
  proveedores: Opcion[];
  tanques: Opcion[];
  bombas: OpcionBomba[];
  operarios: Opcion[];
  /** Bomba ocupada → hoja de ruta que la usa. */
  ocupadas: Record<number, string>;
};

export function FormularioNuevaDescarga(props: Props) {
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [bombaId, setBombaId] = useState("");
  const [ahora] = useState(() => aDiaHora(new Date()));
  const { estado, alEnviar, enviando } = useFormulario<EstadoAccion>(iniciarDescarga, {});

  if (!tipo) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-lg">¿Qué vas a registrar?</p>
        <button type="button" className={`${botonPrincipal} min-h-24 text-2xl`} onClick={() => setTipo("DESCARGA")}>
          Descarga
        </button>
        <button type="button" className={`${botonSecundario} min-h-24 text-2xl`} onClick={() => setTipo("CARGA")}>
          Carga
        </button>
      </div>
    );
  }

  const esCarga = tipo === "CARGA";
  const bomba = props.bombas.find((b) => String(b.id) === bombaId);

  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-5">
      <input type="hidden" name="tipo" value={tipo} />

      <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
        <span className="text-lg font-semibold">{esCarga ? "Carga" : "Descarga"}</span>
        <button type="button" className="min-h-11 px-2 font-semibold text-blue-700" onClick={() => setTipo(null)}>
          Cambiar
        </button>
      </div>

      <Campo etiqueta="Hoja de ruta" ayuda="Solo letras y números, sin espacios.">
        <Texto name="hojaDeRuta" required autoCapitalize="characters" autoComplete="off" />
      </Campo>
      <Campo etiqueta="Patente (opcional)">
        <Texto name="patente" autoCapitalize="characters" autoComplete="off" />
      </Campo>
      <Campo etiqueta="Producto">
        <Desplegable nombre="productoId" opciones={props.productos.map((o) => ({ valor: o.id, texto: o.nombre }))} />
      </Campo>
      <Campo etiqueta={esCarga ? "Cliente" : "Proveedor"}>
        <Desplegable nombre="proveedorId" opciones={props.proveedores.map((o) => ({ valor: o.id, texto: o.nombre }))} />
      </Campo>
      <Campo etiqueta={esCarga ? "Tanque de origen" : "Tanque de destino"}>
        <Desplegable nombre="tanqueId" opciones={props.tanques.map((o) => ({ valor: o.id, texto: o.nombre }))} />
      </Campo>
      <Campo etiqueta="Bomba" ayuda={bomba?.sector ? `Sector ${sectorCorto(bomba.sector)} · ${bomba.sector}` : undefined}>
        <Desplegable
          nombre="bombaId"
          valor={bombaId}
          alCambiar={setBombaId}
          opciones={props.bombas.map((b) => {
            const enUso = props.ocupadas[b.id];
            return { valor: b.id, texto: enUso ? `${b.codigo} — en uso (${enUso})` : b.codigo, deshabilitada: !!enUso };
          })}
        />
      </Campo>
      <Campo etiqueta="Operario">
        <Desplegable nombre="operarioId" opciones={props.operarios.map((o) => ({ valor: o.id, texto: o.nombre }))} />
      </Campo>
      <DiaHora etiqueta="Inicio" dia={ahora.dia} hora={ahora.hora} />
      <Campo etiqueta="Observaciones (opcional)">
        <AreaTexto name="observaciones" maxLength={500} />
      </Campo>

      {estado.error && (
        <p role="alert" className={mensajeError}>
          {estado.error}
        </p>
      )}

      <button type="submit" className={botonPrincipal} disabled={enviando}>
        {enviando ? "Guardando…" : esCarga ? "Iniciar carga" : "Iniciar descarga"}
      </button>
    </form>
  );
}
