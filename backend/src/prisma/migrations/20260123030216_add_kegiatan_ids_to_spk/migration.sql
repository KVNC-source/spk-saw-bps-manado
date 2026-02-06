/*
  Warnings:

  - You are about to drop the column `saw_result_id` on the `spk_document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "spk"."spk_document" DROP COLUMN "saw_result_id",
ADD COLUMN     "kegiatan_ids" INTEGER[];
