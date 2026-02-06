-- CreateEnum
CREATE TYPE "spk"."Role" AS ENUM ('ADMIN', 'MITRA');

-- CreateTable
CREATE TABLE "spk"."user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "spk"."Role" NOT NULL,
    "mitra_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "spk"."user"("username");

-- CreateIndex
CREATE INDEX "user_mitra_id_idx" ON "spk"."user"("mitra_id");

-- AddForeignKey
ALTER TABLE "spk"."user" ADD CONSTRAINT "user_mitra_id_fkey" FOREIGN KEY ("mitra_id") REFERENCES "spk"."mitra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
