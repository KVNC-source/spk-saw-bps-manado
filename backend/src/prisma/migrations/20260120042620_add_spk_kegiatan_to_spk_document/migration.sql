/*
  Warnings:

  - Added the required column `spk_kegiatan` to the `spk_document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "spk"."spk_document" ADD COLUMN     "spk_kegiatan" TEXT NOT NULL;
