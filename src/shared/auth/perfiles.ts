// Perfiles y permisos: el único lugar donde se decide quién puede qué
// (sección 9 de la especificación). Un módulo nuevo agrega acá sus permisos.

export const PERFILES = ["COLABORADOR", "SUPERVISOR"] as const;
export type Perfil = (typeof PERFILES)[number];

export function esPerfil(valor: unknown): valor is Perfil {
  return typeof valor === "string" && (PERFILES as readonly string[]).includes(valor);
}

const AMBOS: readonly Perfil[] = ["COLABORADOR", "SUPERVISOR"];
const SOLO_SUPERVISOR: readonly Perfil[] = ["SUPERVISOR"];

export const PERMISOS = {
  // Crear, pausar, reanudar, finalizar y editar descargas no finalizadas.
  "descargas.operar": AMBOS,
  // Editar cualquier registro, incluso finalizado.
  "descargas.editarFinalizadas": SOLO_SUPERVISOR,
  "tramos.asignarToneladas": SOLO_SUPERVISOR,
  "tablero.ver": AMBOS,
  "tablero.supervisor": SOLO_SUPERVISOR,
  "catalogos.administrar": SOLO_SUPERVISOR,
  "configuracion.administrar": SOLO_SUPERVISOR,
  "pin.cambiar": SOLO_SUPERVISOR,
  "reportes.ver": SOLO_SUPERVISOR,
} as const satisfies Record<string, readonly Perfil[]>;

export type Permiso = keyof typeof PERMISOS;

export function puede(perfil: Perfil, permiso: Permiso): boolean {
  return (PERMISOS[permiso] as readonly Perfil[]).includes(perfil);
}

// Rutas protegidas por prefijo. Las que no figuran son públicas.
const RUTAS: { prefijo: string; perfiles: readonly Perfil[] }[] = [
  { prefijo: "/supervisor", perfiles: SOLO_SUPERVISOR },
  { prefijo: "/api/supervisor", perfiles: SOLO_SUPERVISOR },
  { prefijo: "/colaborador", perfiles: AMBOS },
];

function coincide(ruta: string, prefijo: string): boolean {
  return ruta === prefijo || ruta.startsWith(`${prefijo}/`);
}

/** Perfiles que pueden entrar a la ruta, o null si la ruta es pública. */
export function perfilesDeRuta(ruta: string): readonly Perfil[] | null {
  return RUTAS.find((r) => coincide(ruta, r.prefijo))?.perfiles ?? null;
}

export function inicioDe(perfil: Perfil): string {
  return perfil === "SUPERVISOR" ? "/supervisor" : "/colaborador";
}

export const NOMBRE_PERFIL: Record<Perfil, string> = {
  COLABORADOR: "Colaborador",
  SUPERVISOR: "Supervisor",
};
