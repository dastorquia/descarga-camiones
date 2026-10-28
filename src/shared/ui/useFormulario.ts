"use client";

import { startTransition, useActionState, type FormEvent } from "react";

/**
 * Como useActionState, pero sin que React vacíe el formulario después de enviar:
 * si hay un error, la persona no pierde lo que ya cargó.
 */
export function useFormulario<E>(
  accion: (previo: Awaited<E>, datos: FormData) => Promise<E>,
  inicial: Awaited<E>,
) {
  const [estado, despachar, enviando] = useActionState<E, FormData>(accion, inicial);
  /** Envía datos armados a mano (para botones fuera de un formulario). */
  function enviar(datos: FormData) {
    startTransition(() => despachar(datos));
  }
  function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    enviar(new FormData(evento.currentTarget));
  }
  return { estado, alEnviar, enviar, enviando };
}
