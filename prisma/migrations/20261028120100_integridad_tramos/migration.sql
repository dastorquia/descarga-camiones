-- Integridad de tramos a nivel base de datos (sección 5 y 13 de la especificación).
-- La app valida lo mismo con mensajes claros; esto evita datos inválidos si dos
-- celulares guardan al mismo tiempo. Prisma no modela estas restricciones.

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- El fin, si existe, es posterior al inicio.
ALTER TABLE "TramoBombeo"
  ADD CONSTRAINT "TramoBombeo_fin_posterior_inicio"
  CHECK ("fin" IS NULL OR "fin" > "inicio");

-- Un tramo abierto ocupa desde su inicio hasta el infinito, así que estas dos
-- restricciones impiden tanto los solapamientos como dos tramos abiertos a la vez.

-- Una bomba no puede tener tramos solapados.
ALTER TABLE "TramoBombeo"
  ADD CONSTRAINT "TramoBombeo_bomba_sin_solape"
  EXCLUDE USING gist (
    "bombaId" WITH =,
    tsrange("inicio", COALESCE("fin", 'infinity'::timestamp), '[)') WITH &&
  );

-- Una descarga no puede tener tramos solapados.
ALTER TABLE "TramoBombeo"
  ADD CONSTRAINT "TramoBombeo_descarga_sin_solape"
  EXCLUDE USING gist (
    "descargaId" WITH =,
    tsrange("inicio", COALESCE("fin", 'infinity'::timestamp), '[)') WITH &&
  );
