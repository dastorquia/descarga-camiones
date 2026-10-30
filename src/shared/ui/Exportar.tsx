// Enlaces de descarga a Excel y CSV, con el mismo estilo que en Reportes.

export function BotonExcel({ href, texto = "Descargar Excel" }: { href: string; texto?: string }) {
  return (
    <a
      href={href}
      className="flex min-h-11 items-center justify-center rounded-lg border-2 border-green-700 bg-white px-4 font-semibold text-green-800 hover:bg-green-50"
    >
      {texto}
    </a>
  );
}

export function BotonCsv({ href, texto = "Descargar CSV" }: { href: string; texto?: string }) {
  return (
    <a href={href} className="flex min-h-11 items-center rounded-lg px-3 font-semibold text-blue-700 hover:bg-blue-50">
      {texto}
    </a>
  );
}
