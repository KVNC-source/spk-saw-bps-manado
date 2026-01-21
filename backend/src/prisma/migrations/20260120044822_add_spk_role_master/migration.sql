/*
  Warnings:

  - Added the required column `spk_role` to the `spk_document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spk_role_id` to the `spk_document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "spk"."spk_document" ADD COLUMN     "spk_role" TEXT NOT NULL,
ADD COLUMN     "spk_role_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "spk"."spk_role" (
    "id" SERIAL NOT NULL,
    "kode_role" TEXT NOT NULL,
    "nama_role" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spk_role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "spk_role_kode_role_key" ON "spk"."spk_role"("kode_role");

-- AddForeignKey
ALTER TABLE "spk"."spk_document" ADD CONSTRAINT "spk_document_spk_role_id_fkey" FOREIGN KEY ("spk_role_id") REFERENCES "spk"."spk_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
