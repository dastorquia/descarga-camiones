-- Sector "Otro" con las bombas BEL101 y BEL102 (pedido del 29/10/2026). Solo datos.
INSERT INTO "Bomba" ("codigo", "descripcion") VALUES
  ('BEL101', 'Otro'), ('BEL102', 'Otro')
ON CONFLICT ("codigo") DO NOTHING;
