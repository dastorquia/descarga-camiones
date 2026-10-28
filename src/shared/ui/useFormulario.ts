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
  function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => despachar(datos));
  }
  return { estado, alEnviar, enviando };
}
