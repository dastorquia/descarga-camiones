import type { ReactNode } from "react";

// Campos de formulario grandes y con etiqueta visible, pensados para el celular.

const control =
  "min-h-14 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-lg focus:border-blue-700 focus:outline-none disabled:bg-slate-100";

export function Campo({ etiqueta, ayuda, children }: { etiqueta: string; ayuda?: ReactNode; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-base font-semibold">{etiqueta}</span>
      {children}
      {ayuda && <span className="text-sm text-slate-600">{ayuda}</span>}
    </label>
  );
}

type Opcion = { valor: string | number; texto: string; deshabilitada?: boolean };

export function Desplegable({
  nombre,
  opciones,
  valor,
  alCambiar,
  defecto,
}: {
  nombre: string;
  opciones: Opcion[];
  valor?: string;
  alCambiar?: (valor: string) => void;
  defecto?: string;
}) {
  return (
    <select
      name={nombre}
      required
      className={control}
      {...(valor !== undefined ? { value: valor } : { defaultValue: defecto ?? "" })}
      onChange={alCambiar ? (e) => alCambiar(e.target.value) : undefined}
    >
      <option value="" disabled>
        Elegí una opción
      </option>
      {opciones.map((o) => (
        <option key={o.valor} value={o.valor} disabled={o.deshabilitada}>
          {o.texto}
        </option>
      ))}
    </select>
  );
}

export function Texto(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={control} />;
}

/** Día y hora en dos campos separados (sección 4). `prefijo` cambia los nombres: "inicio" → inicioDia, inicioHora. */
export function DiaHora({ etiqueta, dia, hora, prefijo }: { etiqueta: string; dia: string; hora: string; prefijo?: string }) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-base font-semibold">{etiqueta}</legend>
      <div className="grid grid-cols-2 gap-3">
        <input type="date" name={prefijo ? `${prefijo}Dia` : "dia"} defaultValue={dia} required aria-label={`${etiqueta}: día`} className={control} />
        <input type="time" name={prefijo ? `${prefijo}Hora` : "hora"} defaultValue={hora} required aria-label={`${etiqueta}: hora`} className={control} />
      </div>
    </fieldset>
  );
}

export function AreaTexto(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${control} min-h-24 py-3`} />;
}
