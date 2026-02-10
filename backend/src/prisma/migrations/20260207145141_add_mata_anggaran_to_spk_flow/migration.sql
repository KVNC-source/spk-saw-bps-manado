/*
  Warnings:

  - You are about to drop the column `kegiatan_ids` on the `spk_document` table. All the data in the column will be lost.
  - Added the required column `mata_anggaran_id` to the `alokasi_mitra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mata_anggaran_id` to the `spk_document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "spk"."alokasi_mitra" ADD COLUMN     "mata_anggaran_id" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "spk"."kegiatan" ADD COLUMN     "tarif_per_satuan" INTEGER;

-- AlterTable
ALTER TABLE "spk"."spk_document" DROP COLUMN "kegiatan_ids",
ADD COLUMN     "mata_anggaran_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "spk"."spk_document_item" (
    "id" SERIAL NOT NULL,
    "spk_document_id" INTEGER NOT NULL,
    "kegiatan_id" INTEGER NOT NULL,
    "mata_anggaran_id" INTEGER NOT NULL,
    "jangka_waktu" TEXT NOT NULL,
    "volume" DECIMAL(65,30) NOT NULL,
    "harga_satuan" DECIMAL(65,30) NOT NULL,
    "nilai" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "spk_document_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "spk_document_item_spk_document_id_idx" ON "spk"."spk_document_item"("spk_document_id");

-- CreateIndex
CREATE INDEX "spk_document_item_kegiatan_id_idx" ON "spk"."spk_document_item"("kegiatan_id");

-- CreateIndex
CREATE INDEX "spk_document_item_mata_anggaran_id_idx" ON "spk"."spk_document_item"("mata_anggaran_id");

-- RenameForeignKey
ALTER TABLE "spk"."alokasi_mitra" RENAME CONSTRAINT "alokasi_mitra_kegiatan_id_fkey" TO "fk_alokasi_mitra_kegiatan";

-- RenameForeignKey
ALTER TABLE "spk"."alokasi_mitra" RENAME CONSTRAINT "alokasi_mitra_mitra_id_fkey" TO "fk_alokasi_mitra_mitra";

-- RenameForeignKey
ALTER TABLE "spk"."spk_document" RENAME CONSTRAINT "spk_document_mitra_id_fkey" TO "fk_spk_document_mitra";

-- RenameForeignKey
ALTER TABLE "spk"."spk_document" RENAME CONSTRAINT "spk_document_spk_role_id_fkey" TO "fk_spk_document_role";

-- AddForeignKey
ALTER TABLE "spk"."alokasi_mitra" ADD CONSTRAINT "fk_alokasi_mitra_mata_anggaran" FOREIGN KEY ("mata_anggaran_id") REFERENCES "spk"."mata_anggaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk"."spk_document" ADD CONSTRAINT "fk_spk_document_mata_anggaran" FOREIGN KEY ("mata_anggaran_id") REFERENCES "spk"."mata_anggaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk"."spk_document_item" ADD CONSTRAINT "fk_spk_item_spk" FOREIGN KEY ("spk_document_id") REFERENCES "spk"."spk_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk"."spk_document_item" ADD CONSTRAINT "fk_spk_item_kegiatan" FOREIGN KEY ("kegiatan_id") REFERENCES "spk"."kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk"."spk_document_item" ADD CONSTRAINT "fk_spk_item_mata_anggaran" FOREIGN KEY ("mata_anggaran_id") REFERENCES "spk"."mata_anggaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
