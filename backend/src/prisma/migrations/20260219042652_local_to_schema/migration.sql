/*
  Warnings:

  - You are about to drop the column `mata_anggaran_id` on the `alokasi_mitra` table. All the data in the column will be lost.
  - You are about to drop the column `mata_anggaran_id` on the `spk_document` table. All the data in the column will be lost.
  - You are about to drop the `v_bast_rincian` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nomor_spk]` on the table `alokasi_mitra` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nomor_urut,tahun]` on the table `alokasi_mitra` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tahun,nomor_urut]` on the table `alokasi_mitra` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mitra_id,bulan,tahun]` on the table `spk_document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[spk_document_id,kegiatan_id]` on the table `spk_document_item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `created_by_user_id` to the `spk_document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "spk"."Role" ADD VALUE 'KETUA_TIM';

-- AlterEnum
ALTER TYPE "spk"."SpkStatus" ADD VALUE 'CANCELLED';

-- DropForeignKey
ALTER TABLE "spk"."alokasi_mitra" DROP CONSTRAINT "alokasi_mitra_mata_anggaran_id_fkey";

-- DropForeignKey
ALTER TABLE "spk"."spk_document" DROP CONSTRAINT "spk_document_mata_anggaran_id_fkey";

-- AlterTable
ALTER TABLE "spk"."alokasi_mitra" DROP COLUMN "mata_anggaran_id",
ADD COLUMN     "nomor_spk" TEXT,
ADD COLUMN     "nomor_urut" INTEGER;

-- AlterTable
ALTER TABLE "spk"."spk_document" DROP COLUMN "mata_anggaran_id",
ADD COLUMN     "created_by_user_id" TEXT NOT NULL,
ADD COLUMN     "created_by_user_name" TEXT,
ADD COLUMN     "tanggal_pembayaran" TEXT,
ADD COLUMN     "tanggal_perjanjian" TEXT,
ALTER COLUMN "tanggal_mulai" SET DATA TYPE DATE,
ALTER COLUMN "tanggal_selesai" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "spk"."user" ADD COLUMN     "email" TEXT;

-- DropTable
DROP TABLE "spk"."v_bast_rincian";

-- CreateTable
CREATE TABLE "spk"."spk_request" (
    "id" SERIAL NOT NULL,
    "spk_document_id" INTEGER NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,

    CONSTRAINT "spk_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spk"."spk_request_item" (
    "id" SERIAL NOT NULL,
    "spk_request_id" INTEGER NOT NULL,
    "kegiatan_id" INTEGER NOT NULL,
    "volume" DECIMAL(65,30) NOT NULL,
    "harga_satuan" DECIMAL(65,30) NOT NULL,
    "nilai" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "admin_note" TEXT,

    CONSTRAINT "spk_request_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spk"."penilaian_mitra" (
    "id" SERIAL NOT NULL,
    "spk_document_id" INTEGER NOT NULL,
    "mitra_id" INTEGER NOT NULL,
    "ketepatan_waktu" INTEGER NOT NULL,
    "kualitas" INTEGER NOT NULL,
    "komunikasi" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penilaian_mitra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spk"."saw_criterion" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saw_criterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spk"."penilaian_detail" (
    "id" SERIAL NOT NULL,
    "penilaian_id" INTEGER NOT NULL,
    "criterion_id" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "penilaian_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spk"."alokasi_mitra_detail" (
    "id" SERIAL NOT NULL,
    "alokasi_mitra_id" INTEGER NOT NULL,
    "spk_document_id" INTEGER NOT NULL,
    "mitra_id" INTEGER NOT NULL,
    "kegiatan_id" INTEGER NOT NULL,
    "mata_anggaran_id" INTEGER NOT NULL,
    "nilai" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alokasi_mitra_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spk"."temp_excel_data" (
    "Nama" TEXT,
    "Kegiatan" TEXT,
    "Honor" TEXT,
    "Honor Per Satuan" TEXT,
    "Volume" TEXT,
    "Mata Anggaran" TEXT,
    "Tanggal Mulai" TEXT,
    "Tanggal Berakhir" TEXT
);

-- CreateIndex
CREATE INDEX "spk_request_user_idx" ON "spk"."spk_request"("created_by_user_id");

-- CreateIndex
CREATE INDEX "spk_request_item_request_idx" ON "spk"."spk_request_item"("spk_request_id");

-- CreateIndex
CREATE INDEX "idx_penilaian_mitra_mitra" ON "spk"."penilaian_mitra"("mitra_id");

-- CreateIndex
CREATE INDEX "idx_penilaian_mitra_spk" ON "spk"."penilaian_mitra"("spk_document_id");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_penilaian" ON "spk"."penilaian_mitra"("spk_document_id", "mitra_id");

-- CreateIndex
CREATE UNIQUE INDEX "saw_criterion_key_key" ON "spk"."saw_criterion"("key");

-- CreateIndex
CREATE INDEX "idx_penilaian_detail_criterion" ON "spk"."penilaian_detail"("criterion_id");

-- CreateIndex
CREATE INDEX "idx_penilaian_detail_penilaian" ON "spk"."penilaian_detail"("penilaian_id");

-- CreateIndex
CREATE UNIQUE INDEX "penilaian_detail_penilaian_id_criterion_id_key" ON "spk"."penilaian_detail"("penilaian_id", "criterion_id");

-- CreateIndex
CREATE INDEX "alokasi_mitra_detail_kegiatan_id_idx" ON "spk"."alokasi_mitra_detail"("kegiatan_id");

-- CreateIndex
CREATE INDEX "alokasi_mitra_detail_mata_anggaran_id_idx" ON "spk"."alokasi_mitra_detail"("mata_anggaran_id");

-- CreateIndex
CREATE INDEX "alokasi_mitra_detail_spk_document_id_idx" ON "spk"."alokasi_mitra_detail"("spk_document_id");

-- CreateIndex
CREATE UNIQUE INDEX "alokasi_mitra_nomor_spk_unique" ON "spk"."alokasi_mitra"("nomor_spk");

-- CreateIndex
CREATE INDEX "idx_alokasi_tahun" ON "spk"."alokasi_mitra"("tahun");

-- CreateIndex
CREATE UNIQUE INDEX "alokasi_mitra_nomor_urut_tahun_unique" ON "spk"."alokasi_mitra"("nomor_urut", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_alokasi_nomor_urut_tahun" ON "spk"."alokasi_mitra"("tahun", "nomor_urut");

-- CreateIndex
CREATE INDEX "idx_spk_mitra_bulan_tahun" ON "spk"."spk_document"("mitra_id", "bulan", "tahun");

-- CreateIndex
CREATE INDEX "idx_spk_status" ON "spk"."spk_document"("status");

-- CreateIndex
CREATE INDEX "spk_document_created_by_idx" ON "spk"."spk_document"("created_by_user_id");

-- CreateIndex
CREATE INDEX "spk_document_created_by_status_idx" ON "spk"."spk_document"("created_by_user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_spk_mitra_bulan_tahun" ON "spk"."spk_document"("mitra_id", "bulan", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_spk_kegiatan" ON "spk"."spk_document_item"("spk_document_id", "kegiatan_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_unique" ON "spk"."user"("email");

-- RenameForeignKey
ALTER TABLE "spk"."spk_document" RENAME CONSTRAINT "spk_document_mitra_id_fkey" TO "fk_spk_document_mitra";

-- RenameForeignKey
ALTER TABLE "spk"."spk_document" RENAME CONSTRAINT "spk_document_spk_role_id_fkey" TO "fk_spk_document_role";

-- RenameForeignKey
ALTER TABLE "spk"."spk_document_item" RENAME CONSTRAINT "spk_document_item_kegiatan_id_fkey" TO "fk_spk_item_kegiatan";

-- RenameForeignKey
ALTER TABLE "spk"."spk_document_item" RENAME CONSTRAINT "spk_document_item_mata_anggaran_id_fkey" TO "fk_spk_item_mata_anggaran";

-- RenameForeignKey
ALTER TABLE "spk"."spk_document_item" RENAME CONSTRAINT "spk_document_item_spk_document_id_fkey" TO "fk_spk_item_spk";

-- AddForeignKey
ALTER TABLE "spk"."spk_document" ADD CONSTRAINT "fk_spk_created_by" FOREIGN KEY ("created_by_user_id") REFERENCES "spk"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk"."spk_request" ADD CONSTRAINT "fk_request_spk" FOREIGN KEY ("spk_document_id") REFERENCES "spk"."spk_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk"."spk_request" ADD CONSTRAINT "fk_request_user" FOREIGN KEY ("created_by_user_id") REFERENCES "spk"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk"."spk_request_item" ADD CONSTRAINT "fk_request_item_kegiatan" FOREIGN KEY ("kegiatan_id") REFERENCES "spk"."kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk"."spk_request_item" ADD CONSTRAINT "fk_request_item_request" FOREIGN KEY ("spk_request_id") REFERENCES "spk"."spk_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk"."penilaian_mitra" ADD CONSTRAINT "fk_penilaian_mitra" FOREIGN KEY ("mitra_id") REFERENCES "spk"."mitra"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "spk"."penilaian_mitra" ADD CONSTRAINT "fk_penilaian_spk" FOREIGN KEY ("spk_document_id") REFERENCES "spk"."spk_document"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "spk"."penilaian_detail" ADD CONSTRAINT "penilaian_detail_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "spk"."saw_criterion"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "spk"."penilaian_detail" ADD CONSTRAINT "penilaian_detail_penilaian_id_fkey" FOREIGN KEY ("penilaian_id") REFERENCES "spk"."penilaian_mitra"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
