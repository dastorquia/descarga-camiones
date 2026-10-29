-- Movimientos internos y mantenimiento autónomo (29/10/2026). Tablas nuevas: no modifica las existentes.
-- CreateEnum
CREATE TYPE "TipoTareaAutonoma" AS ENUM ('INSPECCION_CUERPO', 'INSPECCION_SKID', 'LIMPIEZA', 'AJUSTE_PRENSAESTOPAS');

-- CreateTable
CREATE TABLE "MovimientoInterno" (
    "id" SERIAL NOT NULL,
    "tanqueOrigenId" INTEGER NOT NULL,
    "tanqueDestinoId" INTEGER NOT NULL,
    "toneladas" DECIMAL(10,3) NOT NULL,
    "patente" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "bombaCargaId" INTEGER NOT NULL,
    "bombaDescargaId" INTEGER NOT NULL,
    "operarioId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoInterno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BombaAutonomo" (
    "bombaId" INTEGER NOT NULL,

    CONSTRAINT "BombaAutonomo_pkey" PRIMARY KEY ("bombaId")
);

-- CreateTable
CREATE TABLE "TareaAutonoma" (
    "id" SERIAL NOT NULL,
    "bombaId" INTEGER NOT NULL,
    "tarea" "TipoTareaAutonoma" NOT NULL,
    "operarioId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TareaAutonoma_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MovimientoInterno_inicio_idx" ON "MovimientoInterno"("inicio");

-- CreateIndex
CREATE INDEX "TareaAutonoma_bombaId_tarea_fecha_idx" ON "TareaAutonoma"("bombaId", "tarea", "fecha");

-- AddForeignKey
ALTER TABLE "MovimientoInterno" ADD CONSTRAINT "MovimientoInterno_tanqueOrigenId_fkey" FOREIGN KEY ("tanqueOrigenId") REFERENCES "Tanque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoInterno" ADD CONSTRAINT "MovimientoInterno_tanqueDestinoId_fkey" FOREIGN KEY ("tanqueDestinoId") REFERENCES "Tanque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoInterno" ADD CONSTRAINT "MovimientoInterno_bombaCargaId_fkey" FOREIGN KEY ("bombaCargaId") REFERENCES "Bomba"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoInterno" ADD CONSTRAINT "MovimientoInterno_bombaDescargaId_fkey" FOREIGN KEY ("bombaDescargaId") REFERENCES "Bomba"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoInterno" ADD CONSTRAINT "MovimientoInterno_operarioId_fkey" FOREIGN KEY ("operarioId") REFERENCES "Operario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BombaAutonomo" ADD CONSTRAINT "BombaAutonomo_bombaId_fkey" FOREIGN KEY ("bombaId") REFERENCES "Bomba"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaAutonoma" ADD CONSTRAINT "TareaAutonoma_bombaId_fkey" FOREIGN KEY ("bombaId") REFERENCES "Bomba"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaAutonoma" ADD CONSTRAINT "TareaAutonoma_operarioId_fkey" FOREIGN KEY ("operarioId") REFERENCES "Operario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Controles que Prisma no modela.
ALTER TABLE "MovimientoInterno" ADD CONSTRAINT "MovimientoInterno_fin_posterior_inicio" CHECK ("fin" > "inicio");
ALTER TABLE "MovimientoInterno" ADD CONSTRAINT "MovimientoInterno_tanques_distintos" CHECK ("tanqueOrigenId" <> "tanqueDestinoId");
