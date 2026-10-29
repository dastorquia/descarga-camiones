"use client";

import { useState } from "react";
import { CampoPatente } from "@/modules/descargas/componentes/CampoPatente";
import type { Opcion, OpcionBomba } from "@/shared/catalogos/datos";
import { etiquetaBomba } from "@/shared/catalogos/sector";
import { aDiaHora } from "@/shared/lib/fechas";
import { Campo, DiaHora, Desplegable, Texto } from "@/shared/ui/campos";
import { botonPrincipal, mensajeError } from "@/shared/ui/estilos";
import { useFormulario } from "@/shared/ui/useFormulario";
import { registrarMovimiento, type EstadoMovimiento } from "./acciones";

type Props = { tanques: Opcion[]; bombas: OpcionBomba[]; operarios: Opcion[] };

/** Movimiento interno: se carga completo al terminar. */
export function FormularioMovimiento({ tanques, bombas, operarios }: Props) {
  const { estado, alEnviar, enviando } = useFormulario<EstadoMovimiento>(registrarMovimiento, {});
  const [ahora] = useState(() => aDiaHora(new Date()));
  const opcionesTanque = tanques.map((t) => ({ valor: t.id, texto: t.nombre }));
  const opcionesBomba = bombas.map((b) => ({ valor: b.id, texto: etiquetaBomba(b.codigo, b.sector) }));

  return (
    <form onSubmit={alEnviar} className="flex flex-col gap-5">
      <Campo etiqueta="Tanque de origen">
        <Desplegable nombre="tanqueOrigenId" opciones={opcionesTanque} />
      </Campo>
      <Campo etiqueta="Tanque de destino">
        <Desplegable nombre="tanqueDestinoId" opciones={opcionesTanque} />
      </Campo>
      <Campo etiqueta="Kilos" ayuda="Solo números, sin decimales. Por ejemplo 28000.">
        <Texto name="kilos" inputMode="numeric" autoComplete="off" placeholder="28000" required />
      </Campo>
      <Campo etiqueta="Patente (camión/acoplado)" ayuda="La barra se agrega sola.">
        <CampoPatente />
      </Campo>
      <DiaHora etiqueta="Inicio" prefijo="inicio" dia={ahora.dia} hora="" />
      {/* El día de fin viene igual al de inicio: normalmente termina el mismo día. */}
      <DiaHora etiqueta="Fin" prefijo="fin" dia={ahora.dia} hora={ahora.hora} />
      <Campo etiqueta="Bomba de carga">
        <Desplegable nombre="bombaCargaId" opciones={opcionesBomba} />
      </Campo>
      <Campo etiqueta="Bomba de descarga">
        <Desplegable nombre="bombaDescargaId" opciones={opcionesBomba} />
      </Campo>
      <Campo etiqueta="Colaborador">
        <Desplegable nombre="operarioId" opciones={operarios.map((o) => ({ valor: o.id, texto: o.nombre }))} />
      </Campo>
      {estado.error && (
        <p role="alert" className={mensajeError}>
          {estado.error}
        </p>
      )}
      <button type="submit" className={botonPrincipal} disabled={enviando}>
        {enviando ? "Guardando…" : "Registrar movimiento"}
      </button>
    </form>
  );
}
