"use client";

import { useState } from "react";
import type { Opcion, OpcionBomba } from "@/shared/catalogos/datos";
import { CampoAlfanumerico } from "@/shared/ui/CampoAlfanumerico";
import { AreaTexto, Campo, DiaHora, Desplegable, Texto } from "@/shared/ui/campos";
import { botonPrincipal, mensajeError, mensajeExito } from "@/shared/ui/estilos";
import { useFormulario } from "@/shared/ui/useFormulario";
import { propuestaResto } from "../dominio/edicion";
import { aKilosDesdeBase, interpretarKilos } from "../dominio/toneladas";
import { aDiaHora } from "@/shared/lib/fechas";
import { agregarTramo, editarDatosGenerales, editarToneladas, editarTramo, quitarTramo, type EstadoEdicion } from "../edicion-acciones";
import { CampoPatente } from "./CampoPatente";
import { SelectorBomba } from "./SelectorBomba";

type DiaHora = { dia: string; hora: string };

export type DescargaEditable = {
  id: number;
  estado: "EN_CURSO" | "PAUSADA" | "FINALIZADA";
  tipo: "DESCARGA" | "CARGA";
  hojaDeRuta: string;
  patente: string;
  productoId: number;
  proveedorId: number;
  tanqueId: number;
  observaciones: string;
  toneladas: string | null;
  variasBombas: boolean;
  tramos: { id: number; bombaId: number; operarioId: number; inicio: DiaHora; fin: DiaHora | null; toneladas: string | null; bomba: string }[];
};

type Props = {
  descarga: DescargaEditable;
  productos: Opcion[];
  proveedores: Opcion[];
  tanques: Opcion[];
  bombas: OpcionBomba[];
  operarios: Opcion[];
  /** Bombas en uso por otras descargas. */
  noDisponibles: Record<number, string>;
  puedeAsignarToneladas: boolean;
};

const opciones = (lista: Opcion[]) => lista.map((o) => ({ valor: o.id, texto: o.nombre }));

function Mensajes({ estado }: { estado: EstadoEdicion }) {
  return (
    <>
      {estado.error && (
        <p role="alert" className={mensajeError}>
          {estado.error}
        </p>
      )}
      {estado.exito && (
        <p role="status" className={mensajeExito}>
          {estado.exito}
        </p>
      )}
    </>
  );
}

const tarjeta = "flex flex-col gap-5 rounded-2xl border-2 border-slate-200 bg-white p-4";

export function EdicionDescarga(props: Props) {
  return (
    <div className="flex flex-col gap-6">
      <DatosGenerales {...props} />
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Tramos de bombeo</h2>
        {props.descarga.tramos.map((t, i) => (
          <Tramo key={t.id} {...props} tramo={t} numero={i + 1} />
        ))}
        <AgregarTramo {...props} />
      </section>
      {props.puedeAsignarToneladas && props.descarga.estado === "FINALIZADA" && <Toneladas {...props} />}
    </div>
  );
}

function DatosGenerales({ descarga: d, ...p }: Props) {
  const { estado, alEnviar, enviando } = useFormulario<EstadoEdicion>(editarDatosGenerales, {});
  const [tipo, setTipo] = useState<string>(d.tipo);
  const esCarga = tipo === "CARGA";
  return (
    <form onSubmit={alEnviar} className={tarjeta}>
      <h2 className="text-xl font-bold">Datos generales</h2>
      <input type="hidden" name="descargaId" value={d.id} />
      <Campo etiqueta="Tipo">
        <Desplegable
          nombre="tipo"
          valor={tipo}
          alCambiar={setTipo}
          opciones={[
            { valor: "DESCARGA", texto: "Descarga" },
            { valor: "CARGA", texto: "Carga" },
          ]}
        />
      </Campo>
      <Campo etiqueta="Hoja de ruta" ayuda="Solo letras y números.">
        <CampoAlfanumerico nombre="hojaDeRuta" maximo={30} inicial={d.hojaDeRuta} />
      </Campo>
      <Campo etiqueta="Patente (camión/acoplado)" ayuda="La barra se agrega sola. Si no tiene acoplado, cargá solo la del camión.">
        <CampoPatente inicial={d.patente} />
      </Campo>
      <Campo etiqueta="Producto">
        <Desplegable nombre="productoId" defecto={String(d.productoId)} opciones={opciones(p.productos)} />
      </Campo>
      <Campo etiqueta={esCarga ? "Cliente" : "Proveedor"}>
        <Desplegable nombre="proveedorId" defecto={String(d.proveedorId)} opciones={opciones(p.proveedores)} />
      </Campo>
      <Campo etiqueta={esCarga ? "Tanque de origen" : "Tanque de destino"}>
        <Desplegable nombre="tanqueId" defecto={String(d.tanqueId)} opciones={opciones(p.tanques)} />
      </Campo>
      <Campo etiqueta="Observaciones (opcional)">
        <AreaTexto name="observaciones" maxLength={500} defaultValue={d.observaciones} />
      </Campo>
      <Mensajes estado={estado} />
      <button type="submit" className={botonPrincipal} disabled={enviando}>
        {enviando ? "Guardando…" : "Guardar datos generales"}
      </button>
    </form>
  );
}

function Tramo({ descarga: d, tramo: t, numero, ...p }: Props & { tramo: DescargaEditable["tramos"][number]; numero: number }) {
  const { estado, alEnviar, enviando } = useFormulario<EstadoEdicion>(editarTramo, {});
  // Para un tramo cerrado, "en uso ahora" no importa: el servidor revisa el horario elegido.
  const noDisponibles = t.fin ? {} : p.noDisponibles;
  return (
    <div className={tarjeta}>
      <form onSubmit={alEnviar} className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Tramo {numero}</h3>
          {!t.fin && <span className="font-semibold text-green-700">en curso</span>}
        </div>
        <input type="hidden" name="descargaId" value={d.id} />
        <input type="hidden" name="tramoId" value={t.id} />
        <SelectorBomba bombas={p.bombas} noDisponibles={noDisponibles} inicial={String(t.bombaId)} />
        <Campo etiqueta="Operario">
          <Desplegable nombre="operarioId" defecto={String(t.operarioId)} opciones={opciones(p.operarios)} />
        </Campo>
        <DiaHora etiqueta="Inicio" prefijo="inicio" dia={t.inicio.dia} hora={t.inicio.hora} />
        {t.fin && <DiaHora etiqueta="Fin" prefijo="fin" dia={t.fin.dia} hora={t.fin.hora} />}
        <Mensajes estado={estado} />
        <button type="submit" className={botonPrincipal} disabled={enviando}>
          {enviando ? "Guardando…" : `Guardar tramo ${numero}`}
        </button>
      </form>
      {d.tramos.length > 1 && <QuitarTramo descargaId={d.id} tramoId={t.id} numero={numero} enCurso={!t.fin} />}
    </div>
  );
}

/** Quitar en dos pasos, para no borrar por un toque sin querer. */
function QuitarTramo({ descargaId, tramoId, numero, enCurso }: { descargaId: number; tramoId: number; numero: number; enCurso: boolean }) {
  const { estado, enviar: enviarDatos, enviando } = useFormulario<EstadoEdicion>(quitarTramo, {});
  const [confirmando, setConfirmando] = useState(false);
  const enviar = () => {
    const datos = new FormData();
    datos.set("descargaId", String(descargaId));
    datos.set("tramoId", String(tramoId));
    enviarDatos(datos);
  };
  if (!confirmando) {
    return (
      <button type="button" className="min-h-11 self-start px-1 font-semibold text-red-700" onClick={() => setConfirmando(true)}>
        Quitar tramo {numero}
      </button>
    );
  }
  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-red-300 bg-red-50 p-3">
      <p className="text-red-900">
        ¿Quitar el tramo {numero}? Usalo solo si se cargó por error. Queda registrado quién lo quitó.
        {enCurso && " La descarga va a quedar pausada."}
      </p>
      <div className="flex gap-2">
        <button type="button" disabled={enviando} onClick={enviar} className="min-h-11 rounded-lg bg-red-700 px-4 font-semibold text-white hover:bg-red-800">
          {enviando ? "Quitando…" : "Sí, quitar"}
        </button>
        <button type="button" disabled={enviando} onClick={() => setConfirmando(false)} className="min-h-11 rounded-lg px-4 font-semibold">
          No
        </button>
      </div>
      <Mensajes estado={estado} />
    </div>
  );
}

function AgregarTramo({ descarga: d, ...p }: Props) {
  const { estado, alEnviar, enviando } = useFormulario<EstadoEdicion>(agregarTramo, {});
  const [abierto, setAbierto] = useState(false);
  const [hoy] = useState(() => aDiaHora(new Date()).dia);
  if (!abierto) {
    return (
      <button type="button" className="min-h-12 rounded-xl border-2 border-dashed border-slate-300 font-semibold text-blue-700 hover:bg-blue-50" onClick={() => setAbierto(true)}>
        + Agregar un tramo que faltó cargar
      </button>
    );
  }
  return (
    // La key vacía el formulario después de agregar.
    <form key={estado.exito} onSubmit={alEnviar} className={tarjeta}>
      <h3 className="text-lg font-bold">Agregar tramo</h3>
      <p className="text-sm text-slate-600">Para un bombeo que ya terminó y no se registró. Para seguir bombeando ahora, usá Reanudar.</p>
      <input type="hidden" name="descargaId" value={d.id} />
      <SelectorBomba bombas={p.bombas} noDisponibles={{}} />
      <Campo etiqueta="Operario">
        <Desplegable nombre="operarioId" opciones={opciones(p.operarios)} />
      </Campo>
      <DiaHora etiqueta="Inicio" prefijo="inicio" dia={hoy} hora="" />
      <DiaHora etiqueta="Fin" prefijo="fin" dia={hoy} hora="" />
      <Mensajes estado={estado} />
      <button type="submit" className={botonPrincipal} disabled={enviando}>
        {enviando ? "Guardando…" : "Agregar tramo"}
      </button>
    </form>
  );
}

/** Toneladas guardadas → kilos para el campo ("28.450" → "28450"). */
const comoKilos = (v: string | null) => (v ? String(aKilosDesdeBase(v)) : "");

function Toneladas({ descarga: d }: Props) {
  const { estado, alEnviar, enviando } = useFormulario<EstadoEdicion>(editarToneladas, {});
  const [total, setTotal] = useState(comoKilos(d.toneladas));
  const [porTramo, setPorTramo] = useState(() => d.tramos.map((t) => comoKilos(t.toneladas)));

  // Propuesta del resto para el último tramo vacío (sección 5).
  const totalOk = interpretarKilos(total);
  const valores = porTramo.map((v) => {
    const r = interpretarKilos(v);
    return r.ok ? r.valor : null;
  });
  const propuesta = d.variasBombas && totalOk.ok && porTramo.every((v, i) => v === "" || valores[i]) ? propuestaResto(totalOk.valor, valores) : null;

  return (
    <form onSubmit={alEnviar} className={tarjeta}>
      <h2 className="text-xl font-bold">Kilos</h2>
      <input type="hidden" name="descargaId" value={d.id} />
      <Campo etiqueta="Kilos totales (kg)" ayuda="Solo números, sin decimales.">
        <Texto name="kilos" inputMode="numeric" value={total} onChange={(e) => setTotal(e.target.value)} required />
      </Campo>

      {d.variasBombas ? (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-base font-semibold">Asignación manual por tramo</legend>
          <p className="text-sm text-slate-600">
            Esta descarga usó más de una bomba. Podés repartir los kilos entre los tramos; la suma no puede superar el total.
          </p>
          {d.tramos.map((t, i) => (
            <Campo key={t.id} etiqueta={`Tramo ${i + 1} · Bomba ${t.bomba} (kg)`}>
              <Texto
                name={`tramo-${t.id}`}
                inputMode="numeric"
                value={porTramo[i]}
                onChange={(e) => setPorTramo(porTramo.map((v, j) => (j === i ? e.target.value : v)))}
              />
            </Campo>
          ))}
          {propuesta && (
            <button
              type="button"
              className="min-h-11 self-start rounded-lg bg-blue-50 px-3 font-semibold text-blue-700 hover:bg-blue-100"
              onClick={() => setPorTramo(porTramo.map((v, j) => (j === propuesta.indice ? comoKilos(propuesta.valor) : v)))}
            >
              Completar tramo {propuesta.indice + 1} con el resto: {aKilosDesdeBase(propuesta.valor).toLocaleString("es-AR")} kg
            </button>
          )}
        </fieldset>
      ) : (
        <p className="text-sm text-slate-600">Usó una sola bomba: todos los kilos son de esa bomba.</p>
      )}

      <Mensajes estado={estado} />
      <button type="submit" className={botonPrincipal} disabled={enviando}>
        {enviando ? "Guardando…" : "Guardar kilos"}
      </button>
    </form>
  );
}
