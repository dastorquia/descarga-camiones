"use client";

import { useState } from "react";
import type { Opcion, OpcionBomba } from "@/shared/catalogos/datos";
import { aDiaHora } from "@/shared/lib/fechas";
import { CampoAlfanumerico } from "@/shared/ui/CampoAlfanumerico";
import { AreaTexto, Campo, DiaHora, Desplegable } from "@/shared/ui/campos";
import { botonPrincipal, botonSecundario, mensajeError } from "@/shared/ui/estilos";
import { useFormulario } from "@/shared/ui/useFormulario";
import { iniciarDescarga, type EstadoAccion } from "../acciones";
import { CampoPatente } from "./CampoPatente";
import { SelectorBomba } from "./SelectorBomba";

type Tipo = "DESCARGA" | "CARGA";

type Props = {
  productos: Opcion[];
  proveedores: Opcion[];
  tanques: Opcion[];
  bombas: OpcionBomba[];
  operarios: Opcion[];
  /** Bomba que no se puede elegir → motivo ("en uso (HR123)" o "en mantenimiento"). */
  noDisponibles: Record<number, string>;
  /** Si se entró desde un sector del tablero ("Descarga 1"), se ofrecen sus bombas. */
  sector: string | null;
};

export function FormularioNuevaDescarga(props: Props) {
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [soloSector, setSoloSector] = useState(props.sector !== null);
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
  const bombas = soloSector ? props.bombas.filter((b) => b.sector === props.sector) : props.bombas;
  // Desde un sector, se sugiere su primera bomba libre.
  const sugerida = soloSector ? bombas.find((b) => !props.noDisponibles[b.id]) : undefined;

  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-5">
      <input type="hidden" name="tipo" value={tipo} />

      <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
        <span className="text-lg font-semibold">{esCarga ? "Carga" : "Descarga"}</span>
        <button type="button" className="min-h-11 px-2 font-semibold text-blue-700" onClick={() => setTipo(null)}>
          Cambiar
        </button>
      </div>

      <Campo etiqueta="Hoja de ruta" ayuda="Solo letras y números.">
        <CampoAlfanumerico nombre="hojaDeRuta" maximo={30} />
      </Campo>
      <Campo etiqueta="Patente (camión/acoplado)" ayuda="La barra se agrega sola. Si no tiene acoplado, cargá solo la del camión.">
        <CampoPatente />
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
      <div className="flex flex-col gap-1">
        {/* La key reinicia la elección al cambiar entre "solo este sector" y "todas". */}
        <SelectorBomba
          key={String(soloSector)}
          bombas={bombas}
          noDisponibles={props.noDisponibles}
          inicial={sugerida ? String(sugerida.id) : ""}
        />
        {props.sector && (
          <button
            type="button"
            className="min-h-11 self-start px-1 text-base font-semibold text-blue-700"
            onClick={() => setSoloSector(!soloSector)}
          >
            {soloSector ? "Ver bombas de todos los sectores" : `Ver solo bombas de ${props.sector}`}
          </button>
        )}
      </div>
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
