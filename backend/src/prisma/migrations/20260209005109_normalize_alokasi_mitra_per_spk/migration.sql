/*
  Warnings:

  - You are about to drop the column `jumlah` on the `alokasi_mitra` table. All the data in the column will be lost.
  - You are about to drop the column `kegiatan_id` on the `alokasi_mitra` table. All the data in the column will be lost.
  - You are about to drop the column `tarif` on the `alokasi_mitra` table. All the data in the column will be lost.
  - You are about to drop the column `volume` on the `alokasi_mitra` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[spk_document_id]` on the table `alokasi_mitra` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `spk_document_id` to the `alokasi_mitra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_nilai` to the `alokasi_mitra` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "spk"."alokasi_mitra" DROP CONSTRAINT "fk_alokasi_mitra_kegiatan";

-- AlterTable
ALTER TABLE "spk"."alokasi_mitra" DROP COLUMN "jumlah",
DROP COLUMN "kegiatan_id",
DROP COLUMN "tarif",
DROP COLUMN "volume",
ADD COLUMN     "spk_document_id" INTEGER NOT NULL,
ADD COLUMN     "total_nilai" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'APPROVED';

-- CreateIndex
CREATE UNIQUE INDEX "alokasi_mitra_spk_document_id_key" ON "spk"."alokasi_mitra"("spk_document_id");

-- RenameForeignKey
ALTER TABLE "spk"."alokasi_mitra" RENAME CONSTRAINT "fk_alokasi_mitra_mata_anggaran" TO "alokasi_mitra_mata_anggaran_id_fkey";

-- RenameForeignKey
ALTER TABLE "spk"."alokasi_mitra" RENAME CONSTRAINT "fk_alokasi_mitra_mitra" TO "alokasi_mitra_mitra_id_fkey";

-- RenameForeignKey
ALTER TABLE "spk"."spk_document" RENAME CONSTRAINT "fk_spk_document_mata_anggaran" TO "spk_document_mata_anggaran_id_fkey";

-- RenameForeignKey
ALTER TABLE "spk"."spk_document" RENAME CONSTRAINT "fk_spk_document_mitra" TO "spk_document_mitra_id_fkey";

-- RenameForeignKey
ALTER TABLE "spk"."spk_document" RENAME CONSTRAINT "fk_spk_document_role" TO "spk_document_spk_role_id_fkey";

-- RenameForeignKey
ALTER TABLE "spk"."spk_document_item" RENAME CONSTRAINT "fk_spk_item_kegiatan" TO "spk_document_item_kegiatan_id_fkey";

-- RenameForeignKey
ALTER TABLE "spk"."spk_document_item" RENAME CONSTRAINT "fk_spk_item_mata_anggaran" TO "spk_document_item_mata_anggaran_id_fkey";

-- RenameForeignKey
ALTER TABLE "spk"."spk_document_item" RENAME CONSTRAINT "fk_spk_item_spk" TO "spk_document_item_spk_document_id_fkey";

-- AddForeignKey
ALTER TABLE "spk"."alokasi_mitra" ADD CONSTRAINT "alokasi_mitra_spk_document_id_fkey" FOREIGN KEY ("spk_document_id") REFERENCES "spk"."spk_document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
