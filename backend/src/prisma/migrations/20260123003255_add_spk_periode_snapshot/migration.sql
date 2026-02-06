/*
  Warnings:

  - You are about to drop the `v_spk_rekap` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nama_kegiatan,tahun]` on the table `kegiatan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jenis_kegiatan` to the `kegiatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tahun` to the `kegiatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tanggal_mulai` to the `spk_document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tanggal_selesai` to the `spk_document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "spk"."kegiatan" ADD COLUMN     "jenis_kegiatan" TEXT NOT NULL,
ADD COLUMN     "tahun" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "spk"."spk_document" ADD COLUMN     "tanggal_mulai" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "tanggal_selesai" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "spk"."v_spk_rekap";

-- CreateIndex
CREATE INDEX "idx_kegiatan_jenis" ON "spk"."kegiatan"("jenis_kegiatan");

-- CreateIndex
CREATE INDEX "idx_kegiatan_tahun" ON "spk"."kegiatan"("tahun");

-- CreateIndex
CREATE UNIQUE INDEX "kegiatan_nama_tahun_unique" ON "spk"."kegiatan"("nama_kegiatan", "tahun");
