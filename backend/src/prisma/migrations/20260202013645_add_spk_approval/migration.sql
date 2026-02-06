-- CreateEnum
CREATE TYPE "spk"."SpkStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropIndex
DROP INDEX "spk"."user_mitra_id_idx";

-- AlterTable
ALTER TABLE "spk"."spk_document" ADD COLUMN     "admin_note" TEXT,
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" TEXT,
ADD COLUMN     "status" "spk"."SpkStatus" NOT NULL DEFAULT 'PENDING';
