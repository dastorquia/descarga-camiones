-- Datos de demostración generados por scripts/generar-demo.mjs. Borra los registros y carga 50 descargas.

BEGIN;

DELETE FROM "TramoBombeo";

DELETE FROM "Descarga";

DELETE FROM "MovimientoInterno";

DELETE FROM "TareaAutonoma";

DELETE FROM "MantenimientoBomba";

DELETE FROM "AuditLog";

DELETE FROM "IntentoPin";

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78322', 'DESCARGA', 'HT703HR/SX913SX',
  (SELECT id FROM "Producto" WHERE nombre = 'Borrín'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 10'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-114'), 'FINALIZADA', 24.194,
  'Registro de demostración', '2026-10-09 18:25:39.400'::timestamp, '2026-10-09 18:25:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78322'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL102'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 4'), '2026-10-09 18:25:39.400'::timestamp, '2026-10-09 19:03:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78323', 'DESCARGA', 'HX781WA/GJ570CA',
  (SELECT id FROM "Producto" WHERE nombre = 'Borra de neutralización'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 6'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-010'), 'FINALIZADA', 26.675,
  'Registro de demostración', '2026-10-09 21:46:39.400'::timestamp, '2026-10-09 21:46:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78323'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL003'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 4'), '2026-10-09 21:46:39.400'::timestamp, '2026-10-09 22:26:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78324', 'DESCARGA', 'YC670WW/LS450GR',
  (SELECT id FROM "Producto" WHERE nombre = 'Borrín'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 8'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-115'), 'FINALIZADA', 26.146,
  'Registro de demostración', '2026-10-10 09:34:39.400'::timestamp, '2026-10-10 09:34:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78324'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL102'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 2'), '2026-10-10 09:34:39.400'::timestamp, '2026-10-10 10:21:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78325', 'DESCARGA', 'HM270YS/UY770TT',
  (SELECT id FROM "Producto" WHERE nombre = 'Borra'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 6'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-010'), 'FINALIZADA', 27.672,
  'Registro de demostración', '2026-10-10 12:55:39.400'::timestamp, '2026-10-10 12:55:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78325'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL012'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 4'), '2026-10-10 12:55:39.400'::timestamp, '2026-10-10 14:59:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78326', 'DESCARGA', 'LW539JV/RG561PC',
  (SELECT id FROM "Producto" WHERE nombre = 'Borra'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 7'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-001'), 'FINALIZADA', 26.302,
  'Registro de demostración', '2026-10-10 18:53:39.400'::timestamp, '2026-10-10 18:53:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78326'), (SELECT id FROM "Bomba" WHERE codigo = 'BCI010'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 5'), '2026-10-10 18:53:39.400'::timestamp, '2026-10-10 20:13:46.040'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78326'), (SELECT id FROM "Bomba" WHERE codigo = 'BCI010'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 5'), '2026-10-11 06:33:46.040'::timestamp, '2026-10-11 08:19:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78327', 'DESCARGA', 'GK731RK/YJ323GN',
  (SELECT id FROM "Producto" WHERE nombre = 'Borra'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 4'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-001'), 'FINALIZADA', 25.431,
  'Registro de demostración', '2026-10-11 09:51:39.400'::timestamp, '2026-10-11 09:51:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78327'), (SELECT id FROM "Bomba" WHERE codigo = 'BCI010'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 6'), '2026-10-11 09:51:39.400'::timestamp, '2026-10-11 12:21:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78328', 'DESCARGA', 'HS695AU/GM450JC',
  (SELECT id FROM "Producto" WHERE nombre = 'UCO'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 8'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-026'), 'FINALIZADA', 30.748,
  'Registro de demostración', '2026-10-11 13:59:39.400'::timestamp, '2026-10-11 13:59:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78328'), (SELECT id FROM "Bomba" WHERE codigo = 'BCN201'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 2'), '2026-10-11 13:59:39.400'::timestamp, '2026-10-11 14:32:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78329', 'DESCARGA', 'HU175YS/WU525FE',
  (SELECT id FROM "Producto" WHERE nombre = 'Borra de neutralización'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 7'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-006'), 'FINALIZADA', 28.514,
  'Registro de demostración', '2026-10-11 16:30:39.400'::timestamp, '2026-10-11 16:30:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78329'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL003'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 2'), '2026-10-11 16:30:39.400'::timestamp, '2026-10-11 17:15:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78330', 'DESCARGA', 'DN689ZV/UM351WB',
  (SELECT id FROM "Producto" WHERE nombre = 'UCO'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 2'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-026'), 'FINALIZADA', 25.485,
  'Registro de demostración', '2026-10-11 22:29:39.400'::timestamp, '2026-10-11 22:29:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78330'), (SELECT id FROM "Bomba" WHERE codigo = 'BCN201'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 4'), '2026-10-11 22:29:39.400'::timestamp, '2026-10-11 23:07:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78331', 'DESCARGA', 'SD209WJ/CK341WV',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite de pollo'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 5'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-119'), 'FINALIZADA', 24.548,
  'Registro de demostración', '2026-10-12 10:17:39.400'::timestamp, '2026-10-12 10:17:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78331'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL101'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 3'), '2026-10-12 10:17:39.400'::timestamp, '2026-10-12 10:53:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78332', 'DESCARGA', 'SN651XM/WH913CZ',
  (SELECT id FROM "Producto" WHERE nombre = 'Borrín'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 6'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-115'), 'FINALIZADA', 26.902,
  'Registro de demostración', '2026-10-12 12:42:39.400'::timestamp, '2026-10-12 12:42:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78332'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL102'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 1'), '2026-10-12 12:42:39.400'::timestamp, '2026-10-12 13:25:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78333', 'DESCARGA', 'XW341GR/ST921KU',
  (SELECT id FROM "Producto" WHERE nombre = 'Borra'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 8'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-001'), 'FINALIZADA', 25.831,
  'Registro de demostración', '2026-10-12 15:16:39.400'::timestamp, '2026-10-12 15:16:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78333'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL003'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 5'), '2026-10-12 15:16:39.400'::timestamp, '2026-10-12 17:49:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78334', 'DESCARGA', 'DT204MU/LW799XP',
  (SELECT id FROM "Producto" WHERE nombre = 'UCO'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 10'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-026'), 'FINALIZADA', 24.113,
  'Registro de demostración', '2026-10-12 19:24:39.400'::timestamp, '2026-10-12 19:24:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78334'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL019'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 2'), '2026-10-12 19:24:39.400'::timestamp, '2026-10-12 19:55:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78335', 'DESCARGA', 'KX361MW/YJ643UC',
  (SELECT id FROM "Producto" WHERE nombre = 'UCO'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 6'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-026'), 'FINALIZADA', 25.310,
  'Registro de demostración', '2026-10-13 10:12:39.400'::timestamp, '2026-10-13 10:12:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78335'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL019'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 2'), '2026-10-13 10:12:39.400'::timestamp, '2026-10-13 10:48:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78336', 'DESCARGA', 'UT408VR/KJ365PA',
  (SELECT id FROM "Producto" WHERE nombre = 'Borra'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 7'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-010'), 'FINALIZADA', 25.569,
  'Registro de demostración', '2026-10-13 13:49:39.400'::timestamp, '2026-10-13 13:49:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78336'), (SELECT id FROM "Bomba" WHERE codigo = 'BCI010'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 1'), '2026-10-13 13:49:39.400'::timestamp, '2026-10-13 14:48:36.803'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78336'), (SELECT id FROM "Bomba" WHERE codigo = 'BCI010'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 1'), '2026-10-14 03:35:36.803'::timestamp, '2026-10-14 04:39:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78337', 'DESCARGA', 'JP901ML/GG506YJ',
  (SELECT id FROM "Producto" WHERE nombre = 'Borrín'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 4'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-114'), 'FINALIZADA', 27.748,
  'Registro de demostración', '2026-10-13 18:35:39.400'::timestamp, '2026-10-13 18:35:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78337'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL102'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 4'), '2026-10-13 18:35:39.400'::timestamp, '2026-10-13 19:20:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78338', 'DESCARGA', 'FR862ZV/WR535EG',
  (SELECT id FROM "Producto" WHERE nombre = 'Borra de neutralización'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 2'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-006'), 'FINALIZADA', 27.721,
  'Registro de demostración', '2026-10-13 22:39:39.400'::timestamp, '2026-10-13 22:39:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78338'), (SELECT id FROM "Bomba" WHERE codigo = 'BCI010'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 5'), '2026-10-13 22:39:39.400'::timestamp, '2026-10-13 23:28:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78339', 'DESCARGA', 'NX696PK/WP943LS',
  (SELECT id FROM "Producto" WHERE nombre = 'Borra'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 1'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-010'), 'FINALIZADA', 25.716,
  'Registro de demostración', '2026-10-14 11:54:39.400'::timestamp, '2026-10-14 11:54:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78339'), (SELECT id FROM "Bomba" WHERE codigo = 'BCI010'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 1'), '2026-10-14 11:54:39.400'::timestamp, '2026-10-14 14:48:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78340', 'DESCARGA', 'FE735AU/AY356EL',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite de pollo'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 5'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-027'), 'FINALIZADA', 24.669,
  'Registro de demostración', '2026-10-14 17:44:39.400'::timestamp, '2026-10-14 17:44:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78340'), (SELECT id FROM "Bomba" WHERE codigo = 'BCN201'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 2'), '2026-10-14 17:44:39.400'::timestamp, '2026-10-14 18:22:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78341', 'DESCARGA', 'HT111XJ/XW396ND',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 10'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-027'), 'FINALIZADA', 27.781,
  'Registro de demostración', '2026-10-14 21:52:39.400'::timestamp, '2026-10-14 21:52:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78341'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL019'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 6'), '2026-10-14 21:52:39.400'::timestamp, '2026-10-14 22:29:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78342', 'DESCARGA', 'TF466PK/SY419TL',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite de pollo'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 7'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-027'), 'FINALIZADA', 28.496,
  'Registro de demostración', '2026-10-15 12:48:39.400'::timestamp, '2026-10-15 12:48:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78342'), (SELECT id FROM "Bomba" WHERE codigo = 'BCN201'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 2'), '2026-10-15 12:48:39.400'::timestamp, '2026-10-15 13:19:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78343', 'DESCARGA', 'XD979HU/GX314ZM',
  (SELECT id FROM "Producto" WHERE nombre = 'Borrín'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 9'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-114'), 'FINALIZADA', 25.451,
  'Registro de demostración', '2026-10-15 15:42:39.400'::timestamp, '2026-10-15 15:42:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78343'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL102'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 6'), '2026-10-15 15:42:39.400'::timestamp, '2026-10-15 16:30:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78344', 'DESCARGA', 'ZA573TV/DU296AX',
  (SELECT id FROM "Producto" WHERE nombre = 'Borra de neutralización'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 6'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-010'), 'FINALIZADA', 25.330,
  'Registro de demostración', '2026-10-15 21:38:39.400'::timestamp, '2026-10-15 21:38:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78344'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL003'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 4'), '2026-10-15 21:38:39.400'::timestamp, '2026-10-15 22:23:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78345', 'DESCARGA', 'YC916MW/DC796PC',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 2'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-119'), 'FINALIZADA', 27.494,
  'Registro de demostración', '2026-10-16 12:02:39.400'::timestamp, '2026-10-16 12:02:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78345'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL101'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 1'), '2026-10-16 12:02:39.400'::timestamp, '2026-10-16 12:39:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78346', 'DESCARGA', 'RS991VD/BY799MV',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite de pollo'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 4'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-117'), 'FINALIZADA', 30.959,
  'Registro de demostración', '2026-10-16 17:17:39.400'::timestamp, '2026-10-16 17:17:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78346'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL101'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 6'), '2026-10-16 17:17:39.400'::timestamp, '2026-10-16 17:51:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78347', 'DESCARGA', 'DY983TW/HJ139TP',
  (SELECT id FROM "Producto" WHERE nombre = 'UCO'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 10'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-026'), 'FINALIZADA', 25.916,
  'Registro de demostración', '2026-10-16 19:32:39.400'::timestamp, '2026-10-16 19:32:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78347'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL019'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 4'), '2026-10-16 19:32:39.400'::timestamp, '2026-10-16 20:10:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78348', 'DESCARGA', 'EZ191UW/CU105FA',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 10'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-027'), 'FINALIZADA', 28.583,
  'Registro de demostración', '2026-10-17 11:23:39.400'::timestamp, '2026-10-17 11:23:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78348'), (SELECT id FROM "Bomba" WHERE codigo = 'BCN201'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 3'), '2026-10-17 11:23:39.400'::timestamp, '2026-10-17 12:01:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78349', 'DESCARGA', 'WA489CA/MR518CU',
  (SELECT id FROM "Producto" WHERE nombre = 'Borrín'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 1'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-115'), 'FINALIZADA', 26.752,
  'Registro de demostración', '2026-10-17 16:56:39.400'::timestamp, '2026-10-17 16:56:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78349'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL102'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 3'), '2026-10-17 16:56:39.400'::timestamp, '2026-10-17 17:34:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78350', 'DESCARGA', 'FD295BN/CD284HB',
  (SELECT id FROM "Producto" WHERE nombre = 'Borra de neutralización'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 1'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-001'), 'FINALIZADA', 30.788,
  'Registro de demostración', '2026-10-17 21:18:39.400'::timestamp, '2026-10-17 21:18:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78350'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL003'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 1'), '2026-10-17 21:18:39.400'::timestamp, '2026-10-17 22:02:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78351', 'DESCARGA', 'AE910WU/LV350YK',
  (SELECT id FROM "Producto" WHERE nombre = 'UCO'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 4'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-026'), 'FINALIZADA', 30.959,
  'Registro de demostración', '2026-10-18 13:56:39.400'::timestamp, '2026-10-18 13:56:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78351'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL019'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 3'), '2026-10-18 13:56:39.400'::timestamp, '2026-10-18 14:28:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78352', 'DESCARGA', 'VH127VX/FL958VD',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 2'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-027'), 'FINALIZADA', 27.058,
  'Registro de demostración', '2026-10-18 16:02:39.400'::timestamp, '2026-10-18 16:02:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78352'), (SELECT id FROM "Bomba" WHERE codigo = 'BCN201'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 3'), '2026-10-18 16:02:39.400'::timestamp, '2026-10-18 16:36:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78353', 'DESCARGA', 'BY516XF/MW806JV',
  (SELECT id FROM "Producto" WHERE nombre = 'Borra de neutralización'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 3'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-006'), 'FINALIZADA', 24.783,
  'Registro de demostración', '2026-10-18 21:50:39.400'::timestamp, '2026-10-18 21:50:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78353'), (SELECT id FROM "Bomba" WHERE codigo = 'BCI010'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 2'), '2026-10-18 21:50:39.400'::timestamp, '2026-10-18 22:31:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78354', 'DESCARGA', 'LB624SN/NT405LE',
  (SELECT id FROM "Producto" WHERE nombre = 'Borrín'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 5'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-115'), 'FINALIZADA', 30.871,
  'Registro de demostración', '2026-10-19 09:20:39.400'::timestamp, '2026-10-19 09:20:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78354'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL102'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 3'), '2026-10-19 09:20:39.400'::timestamp, '2026-10-19 10:00:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78355', 'DESCARGA', 'YP199SN/XC909HX',
  (SELECT id FROM "Producto" WHERE nombre = 'Borrín'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 6'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-114'), 'FINALIZADA', 26.692,
  'Registro de demostración', '2026-10-19 13:26:39.400'::timestamp, '2026-10-19 13:26:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78355'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL102'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 6'), '2026-10-19 13:26:39.400'::timestamp, '2026-10-19 14:10:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78356', 'DESCARGA', 'YH284JS/YJ983ZN',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 7'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-027'), 'FINALIZADA', 30.831,
  'Registro de demostración', '2026-10-19 17:22:39.400'::timestamp, '2026-10-19 17:22:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78356'), (SELECT id FROM "Bomba" WHERE codigo = 'BCN201'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 3'), '2026-10-19 17:22:39.400'::timestamp, '2026-10-19 17:58:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78357', 'DESCARGA', 'RC398PK/FR779NX',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite de pollo'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 1'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-117'), 'FINALIZADA', 27.354,
  'Registro de demostración', '2026-10-19 21:08:39.400'::timestamp, '2026-10-19 21:08:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78357'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL101'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 6'), '2026-10-19 21:08:39.400'::timestamp, '2026-10-19 21:44:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78358', 'DESCARGA', 'XF639UW/UT652UG',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 3'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-119'), 'FINALIZADA', 30.430,
  'Registro de demostración', '2026-10-20 09:48:39.400'::timestamp, '2026-10-20 09:48:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78358'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL101'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 4'), '2026-10-20 09:48:39.400'::timestamp, '2026-10-20 10:25:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78359', 'DESCARGA', 'RT403VW/PW863AP',
  (SELECT id FROM "Producto" WHERE nombre = 'Borrín'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 5'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-114'), 'FINALIZADA', 25.846,
  'Registro de demostración', '2026-10-20 13:44:39.400'::timestamp, '2026-10-20 13:44:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78359'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL102'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 5'), '2026-10-20 13:44:39.400'::timestamp, '2026-10-20 14:20:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78360', 'DESCARGA', 'BD240ND/XD665CF',
  (SELECT id FROM "Producto" WHERE nombre = 'UCO'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 8'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-026'), 'FINALIZADA', 24.584,
  'Registro de demostración', '2026-10-20 18:15:39.400'::timestamp, '2026-10-20 18:15:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78360'), (SELECT id FROM "Bomba" WHERE codigo = 'BCN201'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 4'), '2026-10-20 18:15:39.400'::timestamp, '2026-10-20 18:46:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78361', 'DESCARGA', 'WV713TA/RL914TZ',
  (SELECT id FROM "Producto" WHERE nombre = 'Borra'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 4'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-001'), 'FINALIZADA', 24.098,
  'Registro de demostración', '2026-10-20 21:12:39.400'::timestamp, '2026-10-20 21:12:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78361'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL010'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 4'), '2026-10-20 21:12:39.400'::timestamp, '2026-10-20 22:52:58.800'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78361'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL010'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 4'), '2026-10-21 10:01:58.800'::timestamp, '2026-10-21 12:04:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78362', 'DESCARGA', 'CM711JH/BH922VT',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite de pollo'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 5'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-119'), 'FINALIZADA', 30.314,
  'Registro de demostración', '2026-10-21 13:01:39.400'::timestamp, '2026-10-21 13:01:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78362'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL101'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 6'), '2026-10-21 13:01:39.400'::timestamp, '2026-10-21 13:34:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78363', 'DESCARGA', 'RM616ZE/DW548HY',
  (SELECT id FROM "Producto" WHERE nombre = 'UCO'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 9'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-026'), 'FINALIZADA', 30.199,
  'Registro de demostración', '2026-10-21 16:01:39.400'::timestamp, '2026-10-21 16:01:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78363'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL019'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 2'), '2026-10-21 16:01:39.400'::timestamp, '2026-10-21 16:38:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78364', 'DESCARGA', 'ND200WR/ML600NH',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 9'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-119'), 'FINALIZADA', 24.352,
  'Registro de demostración', '2026-10-21 19:33:39.400'::timestamp, '2026-10-21 19:33:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78364'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL101'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 2'), '2026-10-21 19:33:39.400'::timestamp, '2026-10-21 20:05:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78365', 'DESCARGA', 'YG797LA/ZR331PC',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 1'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-119'), 'FINALIZADA', 28.182,
  'Registro de demostración', '2026-10-22 11:00:39.400'::timestamp, '2026-10-22 11:00:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78365'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL101'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 3'), '2026-10-22 11:00:39.400'::timestamp, '2026-10-22 11:35:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78366', 'DESCARGA', 'SD246AA/YR663HD',
  (SELECT id FROM "Producto" WHERE nombre = 'Borrín'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 10'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-115'), 'FINALIZADA', 30.018,
  'Registro de demostración', '2026-10-22 16:38:39.400'::timestamp, '2026-10-22 16:38:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78366'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL102'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 1'), '2026-10-22 16:38:39.400'::timestamp, '2026-10-22 17:28:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78367', 'DESCARGA', 'SG976GR/VZ671LD',
  (SELECT id FROM "Producto" WHERE nombre = 'Borra de neutralización'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 3'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-007'), 'FINALIZADA', 27.566,
  'Registro de demostración', '2026-10-22 19:16:39.400'::timestamp, '2026-10-22 19:16:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78367'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL012'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 1'), '2026-10-22 19:16:39.400'::timestamp, '2026-10-22 20:01:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78368', 'DESCARGA', 'YG763EB/CH242HA',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite de pollo'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 9'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-119'), 'FINALIZADA', 27.709,
  'Registro de demostración', '2026-10-23 11:11:39.400'::timestamp, '2026-10-23 11:11:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78368'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL101'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 4'), '2026-10-23 11:11:39.400'::timestamp, '2026-10-23 11:51:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78369', 'DESCARGA', 'CY411VM/WX196MK',
  (SELECT id FROM "Producto" WHERE nombre = 'Borra'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 6'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-001'), 'FINALIZADA', 30.969,
  'Registro de demostración', '2026-10-23 14:07:39.400'::timestamp, '2026-10-23 14:07:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78369'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL010'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 5'), '2026-10-23 14:07:39.400'::timestamp, '2026-10-23 15:51:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78370', 'DESCARGA', 'FV372ZD/MN821RR',
  (SELECT id FROM "Producto" WHERE nombre = 'UCO'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 7'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-026'), 'PAUSADA', NULL,
  'Registro de demostración', '2026-10-29 09:07:39.400'::timestamp, '2026-10-29 09:07:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78370'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL019'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 2'), '2026-10-29 09:07:39.400'::timestamp, '2026-10-29 09:43:39.400'::timestamp);

INSERT INTO "Descarga" ("hojaDeRuta", "tipo", "patente", "productoId", "proveedorId", "tanqueId", "estado", "toneladas", "observaciones", "creadaEn", "actualizadaEn")
VALUES ('78371', 'DESCARGA', 'HN716BC/PG116UB',
  (SELECT id FROM "Producto" WHERE nombre = 'Aceite'), (SELECT id FROM "Proveedor" WHERE nombre = 'Proveedor 10'),
  (SELECT id FROM "Tanque" WHERE codigo = 'TK-119'), 'EN_CURSO', NULL,
  'Registro de demostración', '2026-10-29 13:47:39.400'::timestamp, '2026-10-29 13:47:39.400'::timestamp);

INSERT INTO "TramoBombeo" ("descargaId", "bombaId", "operarioId", "inicio", "fin")
VALUES ((SELECT id FROM "Descarga" WHERE "hojaDeRuta" = '78371'), (SELECT id FROM "Bomba" WHERE codigo = 'BEL101'),
  (SELECT id FROM "Operario" WHERE nombre = 'Colaborador 3'), '2026-10-29 13:47:39.400'::timestamp, NULL);

COMMIT;
