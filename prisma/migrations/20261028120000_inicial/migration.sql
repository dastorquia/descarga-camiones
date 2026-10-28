-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EstadoDescarga" AS ENUM ('EN_CURSO', 'PAUSADA', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "TipoOperacion" AS ENUM ('DESCARGA', 'CARGA');

-- CreateTable
CREATE TABLE "Descarga" (
    "id" SERIAL NOT NULL,
    "hojaDeRuta" TEXT NOT NULL,
    "tipo" "TipoOperacion" NOT NULL DEFAULT 'DESCARGA',
    "patente" TEXT,
    "productoId" INTEGER NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "tanqueId" INTEGER NOT NULL,
    "estado" "EstadoDescarga" NOT NULL DEFAULT 'EN_CURSO',
    "toneladas" DECIMAL(10,3),
    "observaciones" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadaEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Descarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TramoBombeo" (
    "id" SERIAL NOT NULL,
    "descargaId" INTEGER NOT NULL,
    "bombaId" INTEGER NOT NULL,
    "operarioId" INTEGER NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3),
    "toneladas" DECIMAL(10,3),

    CONSTRAINT "TramoBombeo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bomba" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Bomba_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tanque" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Tanque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Operario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("clave")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "perfil" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "antes" JSONB,
    "despues" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Descarga_hojaDeRuta_key" ON "Descarga"("hojaDeRuta");

-- CreateIndex
CREATE INDEX "Descarga_estado_idx" ON "Descarga"("estado");

-- CreateIndex
CREATE INDEX "Descarga_creadaEn_idx" ON "Descarga"("creadaEn");

-- CreateIndex
CREATE INDEX "TramoBombeo_bombaId_inicio_idx" ON "TramoBombeo"("bombaId", "inicio");

-- CreateIndex
CREATE INDEX "TramoBombeo_descargaId_idx" ON "TramoBombeo"("descargaId");

-- CreateIndex
CREATE UNIQUE INDEX "Bomba_codigo_key" ON "Bomba"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Tanque_codigo_key" ON "Tanque"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_nombre_key" ON "Producto"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_nombre_key" ON "Proveedor"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Operario_nombre_key" ON "Operario"("nombre");

-- AddForeignKey
ALTER TABLE "Descarga" ADD CONSTRAINT "Descarga_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Descarga" ADD CONSTRAINT "Descarga_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Descarga" ADD CONSTRAINT "Descarga_tanqueId_fkey" FOREIGN KEY ("tanqueId") REFERENCES "Tanque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TramoBombeo" ADD CONSTRAINT "TramoBombeo_descargaId_fkey" FOREIGN KEY ("descargaId") REFERENCES "Descarga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TramoBombeo" ADD CONSTRAINT "TramoBombeo_bombaId_fkey" FOREIGN KEY ("bombaId") REFERENCES "Bomba"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TramoBombeo" ADD CONSTRAINT "TramoBombeo_operarioId_fkey" FOREIGN KEY ("operarioId") REFERENCES "Operario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
