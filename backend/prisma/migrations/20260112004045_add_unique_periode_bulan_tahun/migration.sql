/*
  Warnings:

  - A unique constraint covering the columns `[nama]` on the table `Kriteria` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Kriteria_nama_key" ON "Kriteria"("nama");
