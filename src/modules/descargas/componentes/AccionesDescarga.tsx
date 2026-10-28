"use client";

import { useRef, useState, type ReactNode } from "react";
import type { Opcion, OpcionBomba } from "@/shared/catalogos/datos";
import { aDiaHora } from "@/shared/lib/fechas";
import { Campo, DiaHora, Desplegable, Texto } from "@/shared/ui/campos";
import { botonPrincipal, botonSecundario, mensajeAviso, mensajeError } from "@/shared/ui/estilos";
import { useFormulario } from "@/shared/ui/useFormulario";
import {
  finalizarDescarga,
  pausarDescarga,
  reanudarDescarga,
  type EstadoAccion,
} from "../acciones";
import { SelectorBomba } from "./SelectorBomba";

type Props = {
  descargaId: number;
  estado: "EN_CURSO" | "PAUSADA" | "FINALIZADA";
  /** Día (AAAA-MM-DD, Argentina) en que empezó el tramo abierto: valor por defecto del día de fin. */
  diaInicioTramoAbierto: string | null;
  ultimaBombaId: number | null;
  ultimoOperarioId: number | null;
  bombas: OpcionBomba[];
  operarios: Opcion[];
  ocupadas: Record<number, string>;
};

type Ventana = "pausar" | "reanudar" | "finalizar" | null;

export function AccionesDescarga(props: Props) {
  const [abierta, setAbierta] = useState<Ventana>(null);
  // Cada vez que se abre una ventana se toma la hora actual como sugerencia.
  const [ahora, setAhora] = useState(() => aDiaHora(new Date()));

  function abrir(ventana: Ventana) {
    setAhora(aDiaHora(new Date()));
    setAbierta(ventana);
  }

  if (props.estado === "FINALIZADA") return null;

  return (
    <>
      <div className="flex flex-col gap-3">
        {props.estado === "EN_CURSO" && (
          <button type="button" className={botonSecundario} onClick={() => abrir("pausar")}>
            Pausar
          </button>
        )}
        {props.estado === "PAUSADA" && (
          <button type="button" className={botonSecundario} onClick={() => abrir("reanudar")}>
            Reanudar
          </button>
        )}
        <button type="button" className={botonPrincipal} onClick={() => abrir("finalizar")}>
          Finalizar
        </button>
      </div>

      {abierta === "pausar" && (
        <Ventana titulo="Pausar" alCerrar={() => setAbierta(null)}>
          <FormularioPausar {...props} hora={ahora.hora} alCancelar={() => setAbierta(null)} />
        </Ventana>
      )}
      {abierta === "reanudar" && (
        <Ventana titulo="Reanudar" alCerrar={() => setAbierta(null)}>
          <FormularioReanudar {...props} dia={ahora.dia} hora={ahora.hora} alCancelar={() => setAbierta(null)} />
        </Ventana>
      )}
      {abierta === "finalizar" && (
        <Ventana titulo="Finalizar" alCerrar={() => setAbierta(null)}>
          <FormularioFinalizar {...props} hora={ahora.hora} alCancelar={() => setAbierta(null)} />
        </Ventana>
      )}
    </>
  );
}

function Ventana({ titulo, alCerrar, children }: { titulo: string; alCerrar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <dialog
      ref={(nodo) => {
        ref.current = nodo;
        if (nodo && !nodo.open) nodo.showModal();
      }}
      onClose={alCerrar}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-5 p-5">
        <h2 className="text-2xl font-bold">{titulo}</h2>
        {children}
      </div>
    </dialog>
  );
}

function Pie({ enviando, texto, alCancelar }: { enviando: boolean; texto: string; alCancelar: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <button type="submit" className={botonPrincipal} disabled={enviando}>
        {enviando ? "Guardando…" : texto}
      </button>
      <button type="button" className={botonSecundario} onClick={alCancelar} disabled={enviando}>
        Cancelar
      </button>
    </div>
  );
}

function Mensajes({ estado }: { estado: EstadoAccion }) {
  return (
    <>
      {estado.error && (
        <p role="alert" className={mensajeError}>
          {estado.error}
        </p>
      )}
      {estado.advertencia && (
        <p role="alert" className={mensajeAviso}>
          {estado.advertencia}
        </p>
      )}
    </>
  );
}

type PropsFormulario = Props & { hora: string; alCancelar: () => void };

function FormularioPausar(props: PropsFormulario) {
  const { estado, alEnviar, enviando } = useFormulario<EstadoAccion>(pausarDescarga, {});
  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-5">
      <input type="hidden" name="descargaId" value={props.descargaId} />
      <DiaHora etiqueta="Fin del tramo" dia={props.diaInicioTramoAbierto ?? ""} hora={props.hora} />
      <Mensajes estado={estado} />
      <Pie enviando={enviando} texto="Pausar" alCancelar={props.alCancelar} />
    </form>
  );
}

function FormularioReanudar(props: PropsFormulario & { dia: string }) {
  const { estado, alEnviar, enviando } = useFormulario<EstadoAccion>(reanudarDescarga, {});
  const inicial = props.ultimaBombaId && !props.ocupadas[props.ultimaBombaId] ? String(props.ultimaBombaId) : "";
  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-5">
      <input type="hidden" name="descargaId" value={props.descargaId} />
      <SelectorBomba bombas={props.bombas} ocupadas={props.ocupadas} inicial={inicial} />
      <Campo etiqueta="Operario">
        <Desplegable
          nombre="operarioId"
          defecto={props.ultimoOperarioId && props.operarios.some((o) => o.id === props.ultimoOperarioId) ? String(props.ultimoOperarioId) : ""}
          opciones={props.operarios.map((o) => ({ valor: o.id, texto: o.nombre }))}
        />
      </Campo>
      <DiaHora etiqueta="Inicio del tramo" dia={props.dia} hora={props.hora} />
      <Mensajes estado={estado} />
      <Pie enviando={enviando} texto="Reanudar" alCancelar={props.alCancelar} />
    </form>
  );
}

function FormularioFinalizar(props: PropsFormulario) {
  const { estado, alEnviar, enviando } = useFormulario<EstadoAccion>(finalizarDescarga, {});
  const [toneladas, setToneladas] = useState("");
  // Si el servidor advirtió que el valor es raro, reenviar ese mismo valor lo confirma.
  const confirmar = estado.confirmar !== undefined && estado.confirmar === toneladas;
  const cierraTramo = props.estado === "EN_CURSO";
  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-5">
      <input type="hidden" name="descargaId" value={props.descargaId} />
      <input type="hidden" name="confirmado" value={confirmar ? toneladas : ""} />
      {cierraTramo ? (
        <DiaHora etiqueta="Fin del tramo" dia={props.diaInicioTramoAbierto ?? ""} hora={props.hora} />
      ) : (
        <>
          <input type="hidden" name="dia" value="" />
          <input type="hidden" name="hora" value="" />
        </>
      )}
      <Campo etiqueta="Toneladas totales" ayuda="Usá coma para los decimales, por ejemplo 28,450.">
        <div className="relative">
          <Texto
            name="toneladas"
            inputMode="decimal"
            autoComplete="off"
            placeholder="28,000"
            required
            value={toneladas}
            onChange={(e) => setToneladas(e.target.value)}
          />
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg font-semibold text-slate-600">
            t
          </span>
        </div>
      </Campo>
      <Mensajes estado={confirmar ? estado : { error: estado.error }} />
      <Pie
        enviando={enviando}
        texto={confirmar ? "Sí, está bien. Finalizar" : "Finalizar"}
        alCancelar={props.alCancelar}
      />
    </form>
  );
}
