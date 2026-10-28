-- Bombas en mantenimiento (pedido del 29/10/2026). Tabla nueva: no modifica las existentes.

-- CreateTable
CREATE TABLE "MantenimientoBomba" (
    "id" SERIAL NOT NULL,
    "bombaId" INTEGER NOT NULL,
    "desde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasta" TIMESTAMP(3),
    "motivo" TEXT,

    CONSTRAINT "MantenimientoBomba_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MantenimientoBomba_bombaId_desde_idx" ON "MantenimientoBomba"("bombaId", "desde");

-- AddForeignKey
ALTER TABLE "MantenimientoBomba" ADD CONSTRAINT "MantenimientoBomba_bombaId_fkey" FOREIGN KEY ("bombaId") REFERENCES "Bomba"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Un solo mantenimiento abierto por bomba (Prisma no modela esta restricción).
ALTER TABLE "MantenimientoBomba"
  ADD CONSTRAINT "MantenimientoBomba_uno_abierto"
  EXCLUDE USING gist ("bombaId" WITH =) WHERE ("hasta" IS NULL);

-- El fin, si existe, es posterior al inicio.
ALTER TABLE "MantenimientoBomba"
  ADD CONSTRAINT "MantenimientoBomba_hasta_posterior_desde"
  CHECK ("hasta" IS NULL OR "hasta" > "desde");
