-- Mantenimiento autónomo: comentario breve opcional (30/10/2026). Migración aditiva.
ALTER TABLE "TareaAutonoma" ADD COLUMN "observaciones" TEXT;
ALTER TABLE "TareaAutonoma" ADD CONSTRAINT "TareaAutonoma_observaciones_largo" CHECK (char_length("observaciones") <= 200);
