-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MITRA');

-- CreateEnum
CREATE TYPE "PeriodeStatus" AS ENUM ('OPEN', 'LOCKED');

-- CreateEnum
CREATE TYPE "RekapStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED');

-- CreateEnum
CREATE TYPE "DokumenJenis" AS ENUM ('SPK', 'BAST');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mitra" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" TEXT,
    "alamat" TEXT,
    "bank" TEXT,
    "noRekening" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mitra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Periode" (
    "id" TEXT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "status" "PeriodeStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Periode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BebanKerja" (
    "id" TEXT NOT NULL,
    "mitraId" TEXT NOT NULL,
    "periodeId" TEXT NOT NULL,
    "uraian" TEXT NOT NULL,
    "volume" INTEGER NOT NULL,
    "satuan" TEXT NOT NULL,
    "tarif" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BebanKerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HonorRekap" (
    "id" TEXT NOT NULL,
    "mitraId" TEXT NOT NULL,
    "periodeId" TEXT NOT NULL,
    "totalHonor" DECIMAL(12,2) NOT NULL,
    "status" "RekapStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HonorRekap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dokumen" (
    "id" TEXT NOT NULL,
    "mitraId" TEXT NOT NULL,
    "periodeId" TEXT NOT NULL,
    "jenis" "DokumenJenis" NOT NULL,
    "nomor" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dokumen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mitra_userId_key" ON "Mitra"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HonorRekap_mitraId_periodeId_key" ON "HonorRekap"("mitraId", "periodeId");

-- CreateIndex
CREATE UNIQUE INDEX "Dokumen_mitraId_periodeId_jenis_key" ON "Dokumen"("mitraId", "periodeId", "jenis");

-- AddForeignKey
ALTER TABLE "Mitra" ADD CONSTRAINT "Mitra_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BebanKerja" ADD CONSTRAINT "BebanKerja_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BebanKerja" ADD CONSTRAINT "BebanKerja_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "Periode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HonorRekap" ADD CONSTRAINT "HonorRekap_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HonorRekap" ADD CONSTRAINT "HonorRekap_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "Periode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dokumen" ADD CONSTRAINT "Dokumen_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "Mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dokumen" ADD CONSTRAINT "Dokumen_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "Periode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
