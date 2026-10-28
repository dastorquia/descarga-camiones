"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { entrarComoSupervisor, type EstadoFormulario } from "@/shared/auth/acciones";
import { mensajeError } from "@/shared/ui/estilos";

const LARGO_MAXIMO = 8;
const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const base = "flex min-h-16 items-center justify-center rounded-xl border-2 font-semibold disabled:opacity-50";
const tecla = `${base} border-slate-300 bg-white text-2xl active:bg-slate-100 hover:bg-slate-100`;
const teclaEntrar = `${base} border-blue-700 bg-blue-700 text-lg text-white active:bg-blue-800 hover:bg-blue-800`;

export function TecladoPin() {
  const [pin, setPin] = useState("");
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(
    async (previo, datos) => {
      const resultado = await entrarComoSupervisor(previo, datos);
      // Después de un error se borra lo tipeado para reintentar.
      if (resultado.error) setPin("");
      return resultado;
    },
    {},
  );
  const formulario = useRef<HTMLFormElement>(null);

  // En la computadora también se puede usar el teclado físico.
  useEffect(() => {
    function alPresionar(evento: KeyboardEvent) {
      if (/^\d$/.test(evento.key)) setPin((p) => (p.length < LARGO_MAXIMO ? p + evento.key : p));
      else if (evento.key === "Backspace") setPin((p) => p.slice(0, -1));
      else if (evento.key === "Enter") {
        // Mismo criterio que el botón Entrar: solo con 4 números o más.
        evento.preventDefault();
        const enviar = formulario.current?.querySelector<HTMLButtonElement>("button[type=submit]");
        if (enviar && !enviar.disabled) enviar.click();
      }
    }
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, []);

  const agregar = (digito: string) => setPin((p) => (p.length < LARGO_MAXIMO ? p + digito : p));

  return (
    <form ref={formulario} action={accion} className="flex flex-col gap-5">
      <input type="hidden" name="pin" value={pin} />

      <div
        aria-label={`PIN: ${pin.length} números ingresados`}
        className="flex min-h-14 items-center justify-center gap-3 rounded-xl border-2 border-slate-300 bg-white"
      >
        {pin.length === 0 ? (
          <span className="text-lg text-slate-400">Ingresá el PIN</span>
        ) : (
          Array.from(pin).map((_, i) => <span key={i} className="size-4 rounded-full bg-slate-800" />)
        )}
      </div>

      {estado.error && (
        <p role="alert" className={mensajeError}>
          {estado.error}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3">
        {TECLAS.map((d) => (
          <button key={d} type="button" className={tecla} onClick={() => agregar(d)} disabled={enviando}>
            {d}
          </button>
        ))}
        <button
          type="button"
          className={`${tecla} text-lg`}
          onClick={() => setPin((p) => p.slice(0, -1))}
          disabled={enviando || pin.length === 0}
        >
          Borrar
        </button>
        <button type="button" className={tecla} onClick={() => agregar("0")} disabled={enviando}>
          0
        </button>
        <button type="submit" className={teclaEntrar} disabled={enviando || pin.length < 4}>
          {enviando ? "…" : "Entrar"}
        </button>
      </div>
    </form>
  );
}
