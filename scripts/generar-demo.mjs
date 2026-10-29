// Genera scripts/demo.sql: borra los registros cargados (descargas, tramos, movimientos,
// tareas, mantenimientos, auditoría, intentos de PIN) y carga 50 descargas de demostración.
// Los catálogos, el PIN y la configuración no se tocan.
// Uso: node scripts/generar-demo.mjs   (siempre genera lo mismo: semilla fija)

import { writeFileSync } from "node:fs";

// Generador pseudoaleatorio con semilla fija (mulberry32).
let semilla = 20261029;
const azar = () => {
  semilla = (semilla + 0x6d2b79f5) | 0;
  let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const elegir = (lista) => lista[Math.floor(azar() * lista.length)];
const entre = (min, max) => min + azar() * (max - min);

// Reglas del usuario (29/10/2026): producto → tanques posibles, bombas posibles y duración (minutos).
const D123 = ["BCI010", "BEL003", "BEL010", "BEL012", "BEL021", "BEL004", "BEL013"];
const D4 = ["BEL019", "BCN201"];
const REGLAS = [
  { producto: "Borra de neutralización", tanques: ["TK-001", "TK-006", "TK-007", "TK-010"], bombas: () => D123, minutos: () => entre(38, 52) },
  { producto: "Borra", tanques: ["TK-001", "TK-010"], bombas: () => D123, minutos: () => entre(90, 240) },
  { producto: "UCO", tanques: ["TK-026"], bombas: () => D4, minutos: () => entre(30, 40) },
  { producto: "Aceite", tanques: ["TK-027", "TK-117", "TK-119"], bombas: (tk) => (tk === "TK-027" ? D4 : ["BEL101"]), minutos: () => entre(30, 40) },
  { producto: "Aceite de pollo", tanques: ["TK-027", "TK-117", "TK-119"], bombas: (tk) => (tk === "TK-027" ? D4 : ["BEL101"]), minutos: () => entre(30, 40) },
  { producto: "Borrín", tanques: ["TK-114", "TK-115"], bombas: () => ["BEL102"], minutos: () => entre(35, 50) },
];

const MIN = 60_000;
const ahora = Date.now();
const LETRAS = "ABCDEFGHJKLMNPRSTUVWXYZ";
const patenteNueva = () => `${elegir(LETRAS)}${elegir(LETRAS)}${Math.floor(entre(100, 999))}${elegir(LETRAS)}${elegir(LETRAS)}`;

// Agenda por bomba para que una bomba nunca tenga dos tramos a la vez.
const ocupada = new Map(); // bomba → [[inicio, fin]]
const libre = (bomba, ini, fin) => (ocupada.get(bomba) ?? []).every(([a, b]) => fin <= a || ini >= b);
const reservar = (bomba, ini, fin) => ocupada.set(bomba, [...(ocupada.get(bomba) ?? []), [ini, fin]]);

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const ts = (ms) => `${q(new Date(ms).toISOString().replace("T", " ").replace("Z", ""))}::timestamp`;

const sentencias = [
  "-- Datos de demostración generados por scripts/generar-demo.mjs. Borra los registros y carga 50 descargas.",
  "BEGIN;",
  'DELETE FROM "TramoBombeo";',
  'DELETE FROM "Descarga";',
  'DELETE FROM "MovimientoInterno";',
  'DELETE FROM "TareaAutonoma";',
  'DELETE FROM "MantenimientoBomba";',
  'DELETE FROM "AuditLog";',
  'DELETE FROM "IntentoPin";',
];

const TOTAL = 50;
let inicioBase = ahora - 20 * 24 * 60 * MIN; // últimos ~20 días
for (let i = 0; i < TOTAL; i++) {
  const regla = elegir(REGLAS);
  const tanque = elegir(regla.tanques);
  const opciones = regla.bombas(tanque);
  const duracion = Math.round(regla.minutos()) * MIN;
  const ultima = i === TOTAL - 1; // la última queda en curso
  const anteultima = i === TOTAL - 2; // la anteúltima queda pausada
  // Las borras largas a veces se pausan a la noche y siguen al otro día (dos tramos).
  const conPausa = !ultima && regla.producto === "Borra" && azar() < 0.4;

  // Avanza el reloj entre 2 y 6 horas por camión, en horario de planta (6 a 20 h, Argentina = UTC-3).
  let ini;
  let bomba;
  for (let intento = 0; intento < 200; intento++) {
    inicioBase += Math.round(entre(2, 6) * 60) * MIN;
    const horaAr = new Date(inicioBase - 3 * 60 * MIN).getUTCHours();
    if (horaAr < 6 || horaAr > 19) continue;
    const libres = opciones.filter((b) => libre(b, inicioBase, inicioBase + duracion * 2));
    bomba = libres.length ? elegir(libres) : undefined;
    if (bomba) { ini = inicioBase; break; }
  }
  // Las dos últimas se ubican cerca de ahora, con una bomba que esté libre en ese momento.
  if (ultima) ini = ahora - 20 * MIN; // en curso desde hace 20 minutos
  if (anteultima) ini = ahora - 5 * 60 * MIN;
  if (ultima || anteultima) bomba = opciones.find((b) => libre(b, ini, ahora + 24 * 60 * MIN)) ?? bomba;
  if (!ultima && !anteultima && ini + duracion * 2 > ahora - 6 * 60 * MIN) throw new Error("La demo se pasa de la fecha actual: achicar el paso.");

  const tramos = [];
  if (conPausa) {
    const primera = Math.round(duracion * entre(0.4, 0.6));
    tramos.push([ini, ini + primera]);
    const reanuda = ini + primera + Math.round(entre(9, 13) * 60) * MIN; // al otro día
    tramos.push([reanuda, reanuda + (duracion - primera)]);
  } else if (ultima) {
    tramos.push([ini, null]);
  } else {
    tramos.push([ini, ini + duracion]);
  }
  for (const [a, b] of tramos) reservar(bomba, a, b ?? ahora + 24 * 60 * MIN);

  const estado = ultima ? "EN_CURSO" : anteultima ? "PAUSADA" : "FINALIZADA";
  const kilos = estado === "FINALIZADA" ? Math.round(entre(24000, 31000)) : null;
  const hoja = String(78322 + i);
  const proveedor = `Proveedor ${1 + Math.floor(azar() * 10)}`;
  const operario = `Colaborador ${1 + Math.floor(azar() * 6)}`;

  sentencias.push(
    `INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES (${q(hoja)}, 'DESCARGA', ${q(`${patenteNueva()}/${patenteNueva()}`)},
  (SELECT id FROM "Producto" WHERE nombre = ${q(regla.producto)}), (SELECT id FROM "Proveedor" WHERE nombre = ${q(proveedor)}),
  (SELECT id FROM "Tanque" WHERE codigo = ${q(tanque)}), '${estado}', ${kilos === null ? "NULL" : (kilos / 1000).toFixed(3)},
  'Registro de demostración', ${ts(ini)}, ${ts(ini)});`,
  );
  for (const [a, b] of tramos) {
    sentencias.push(
      `INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = ${q(hoja)}), (SELECT id FROM "Bomba" WHERE codigo = ${q(bomba)}),
  (SELECT id FROM "Operario" WHERE nombre = ${q(operario)}), ${ts(a)}, ${b === null ? "NULL" : ts(b)});`,
    );
  }
}
sentencias.push("COMMIT;");
writeFileSync(new URL("./demo.sql", import.meta.url), sentencias.join("\n\n") + "\n");
console.log(`demo.sql generado: ${TOTAL} descargas.`);
