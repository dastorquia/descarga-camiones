import { esPerfil, type Perfil } from "./perfiles";

// Token de sesión firmado con HMAC-SHA256: "<datos en base64url>.<firma>".
// No es secreto (el contenido se puede leer), pero no se puede alterar sin
// conocer SESSION_SECRET. Usa Web Crypto, disponible en el proxy y en el servidor.

export type DatosSesion = {
  perfil: Perfil;
  /** Última actividad, en milisegundos desde 1970 (UTC). */
  actividad: number;
};

const MINUTO = 60_000;

/** Inactividad máxima antes de que la sesión venza. */
export const INACTIVIDAD_MAXIMA_MS: Record<Perfil, number> = {
  SUPERVISOR: 30 * MINUTO,
  COLABORADOR: 30 * 24 * 60 * MINUTO,
};

const codificador = new TextEncoder();

function aBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

async function clave(secreto: string): Promise<CryptoKey> {
  if (secreto.length < 32) {
    throw new Error("SESSION_SECRET debe tener al menos 32 caracteres");
  }
  return crypto.subtle.importKey(
    "raw",
    codificador.encode(secreto),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function firmarSesion(datos: DatosSesion, secreto: string): Promise<string> {
  const cuerpo = aBase64Url(codificador.encode(JSON.stringify(datos)));
  const firma = await crypto.subtle.sign("HMAC", await clave(secreto), codificador.encode(cuerpo));
  return `${cuerpo}.${aBase64Url(new Uint8Array(firma))}`;
}

/** Devuelve los datos si la firma es válida, sin mirar si venció. */
export async function leerSesion(
  token: string | undefined,
  secreto: string,
): Promise<DatosSesion | null> {
  if (!token) return null;
  const [cuerpo, firma, ...resto] = token.split(".");
  if (!cuerpo || !firma || resto.length > 0) return null;

  const valida = await crypto.subtle.verify(
    "HMAC",
    await clave(secreto),
    Buffer.from(firma, "base64url"),
    codificador.encode(cuerpo),
  );
  if (!valida) return null;

  try {
    const datos: unknown = JSON.parse(Buffer.from(cuerpo, "base64url").toString("utf8"));
    if (
      typeof datos === "object" &&
      datos !== null &&
      "perfil" in datos &&
      "actividad" in datos &&
      esPerfil(datos.perfil) &&
      typeof datos.actividad === "number"
    ) {
      return { perfil: datos.perfil, actividad: datos.actividad };
    }
  } catch {
    // contenido ilegible: se trata como sin sesión
  }
  return null;
}

export function sesionVigente(datos: DatosSesion, ahora: number): boolean {
  const inactivo = ahora - datos.actividad;
  return inactivo >= 0 && inactivo <= INACTIVIDAD_MAXIMA_MS[datos.perfil];
}
