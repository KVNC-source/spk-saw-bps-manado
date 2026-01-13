/*
  Warnings:

  - A unique constraint covering the columns `[bulan,tahun]` on the table `Periode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TipeKriteria" AS ENUM ('BENEFIT', 'COST');

-- CreateTable
CREATE TABLE "Kriteria" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "bobot" DOUBLE PRECISION NOT NULL,
    "tipe" "TipeKriteria" NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PenilaianSPK" (
    "id" TEXT NOT NULL,
    "mitraId" TEXT NOT NULL,
    "kriteriaId" TEXT NOT NULL,
    "periodeId" TEXT NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PenilaianSPK_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpkRunLog" (
    "id" TEXT NOT NULL,
    "periodeId" TEXT NOT NULL,
    "runBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpkRunLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PenilaianSPK_mitraId_kriteriaId_periodeId_key" ON "PenilaianSPK"("mitraId", "kriteriaId", "periodeId");

-- CreateIndex
CREATE UNIQUE INDEX "Periode_bulan_tahun_key" ON "Periode"("bulan", "tahun");

-- AddForeignKey
ALTER TABLE "PenilaianSPK" ADD CONSTRAINT "PenilaianSPK_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenilaianSPK" ADD CONSTRAINT "PenilaianSPK_kriteriaId_fkey" FOREIGN KEY ("kriteriaId") REFERENCES "Kriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenilaianSPK" ADD CONSTRAINT "PenilaianSPK_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "Periode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpkRunLog" ADD CONSTRAINT "SpkRunLog_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "Periode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpkRunLog" ADD CONSTRAINT "SpkRunLog_runBy_fkey" FOREIGN KEY ("runBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
