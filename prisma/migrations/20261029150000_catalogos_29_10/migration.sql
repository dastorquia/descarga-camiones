-- Catálogos pedidos el 29/10/2026 (solo datos; no cambia tablas).
-- Se puede aplicar más de una vez sin duplicar nada.

-- Tanques nuevos (los TK se escriben con 3 dígitos, como los existentes).
INSERT INTO "Tanque" ("codigo") VALUES
  ('TK-025'), ('TK-026'), ('TK-027'), ('TK-706'), ('TK-707'), ('PLT-801'), ('PLT-802')
ON CONFLICT ("codigo") DO NOTHING;

-- Descarga 4 con sus dos bombas.
INSERT INTO "Bomba" ("codigo", "descripcion") VALUES
  ('BEL019', 'Descarga 4'), ('BCN201', 'Descarga 4')
ON CONFLICT ("codigo") DO NOTHING;

-- Colaboradores genéricos: los nombres reales se reemplazan (también en el historial).
UPDATE "Operario" SET "nombre" = 'Colaborador 1'
  WHERE "nombre" = 'Adrián Aguirre' AND NOT EXISTS (SELECT 1 FROM "Operario" WHERE "nombre" = 'Colaborador 1');
UPDATE "Operario" SET "nombre" = 'Colaborador 2'
  WHERE "nombre" = 'Iván Balmaceda' AND NOT EXISTS (SELECT 1 FROM "Operario" WHERE "nombre" = 'Colaborador 2');
INSERT INTO "Operario" ("nombre")
  SELECT 'Colaborador ' || n FROM generate_series(1, 6) AS n
ON CONFLICT ("nombre") DO NOTHING;
UPDATE "Operario" SET "activo" = false WHERE "nombre" NOT LIKE 'Colaborador %';

-- Proveedores genéricos: los anteriores se desactivan (se conservan en el historial).
INSERT INTO "Proveedor" ("nombre")
  SELECT 'Proveedor ' || n FROM generate_series(1, 10) AS n
ON CONFLICT ("nombre") DO NOTHING;
UPDATE "Proveedor" SET "activo" = false WHERE "nombre" NOT LIKE 'Proveedor %';
