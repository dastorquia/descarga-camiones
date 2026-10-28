-- CreateTable
CREATE TABLE "IntentoPin" (
    "clave" TEXT NOT NULL,
    "fallidos" INTEGER NOT NULL DEFAULT 0,
    "bloqueadoHasta" TIMESTAMP(3),
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntentoPin_pkey" PRIMARY KEY ("clave")
);
