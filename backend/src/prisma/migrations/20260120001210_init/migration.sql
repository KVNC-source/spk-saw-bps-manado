-- CreateTable
CREATE TABLE "spk"."mitra" (
    "id" SERIAL NOT NULL,
    "nama_mitra" TEXT NOT NULL,
    "nik" TEXT,
    "email" TEXT,
    "alamat" TEXT,
    "no_hp" TEXT,
    "bank" TEXT,
    "no_rekening" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mitra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spk"."mata_anggaran" (
    "id" SERIAL NOT NULL,
    "kode_anggaran" TEXT NOT NULL,
    "nama_anggaran" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mata_anggaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spk"."kegiatan" (
    "id" SERIAL NOT NULL,
    "kode_kegiatan" TEXT,
    "nama_kegiatan" TEXT NOT NULL,
    "satuan" TEXT,
    "mata_anggaran_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spk"."alokasi_mitra" (
    "id" SERIAL NOT NULL,
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "mitra_id" INTEGER NOT NULL,
    "kegiatan_id" INTEGER NOT NULL,
    "volume" DECIMAL(65,30) NOT NULL,
    "tarif" DECIMAL(65,30) NOT NULL,
    "jumlah" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alokasi_mitra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spk"."spk_document" (
    "id" SERIAL NOT NULL,
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "mitra_id" INTEGER NOT NULL,
    "saw_result_id" INTEGER NOT NULL,
    "total_honorarium" DECIMAL(65,30) NOT NULL,
    "nomor_spk" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spk_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spk"."v_spk_rekap" (
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "nama_mitra" TEXT NOT NULL,
    "kode_anggaran" TEXT NOT NULL,
    "nama_anggaran" TEXT NOT NULL,
    "total_nilai" DECIMAL(65,30) NOT NULL
);

-- CreateTable
CREATE TABLE "spk"."v_bast_rincian" (
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER NOT NULL,
    "nama_mitra" TEXT NOT NULL,
    "nama_kegiatan" TEXT NOT NULL,
    "kode_anggaran" TEXT NOT NULL,
    "volume" DECIMAL(65,30) NOT NULL,
    "tarif" DECIMAL(65,30) NOT NULL,
    "jumlah" DECIMAL(65,30) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "mata_anggaran_kode_anggaran_tahun_key" ON "spk"."mata_anggaran"("kode_anggaran", "tahun");

-- AddForeignKey
ALTER TABLE "spk"."kegiatan" ADD CONSTRAINT "kegiatan_mata_anggaran_id_fkey" FOREIGN KEY ("mata_anggaran_id") REFERENCES "spk"."mata_anggaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk"."alokasi_mitra" ADD CONSTRAINT "alokasi_mitra_mitra_id_fkey" FOREIGN KEY ("mitra_id") REFERENCES "spk"."mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk"."alokasi_mitra" ADD CONSTRAINT "alokasi_mitra_kegiatan_id_fkey" FOREIGN KEY ("kegiatan_id") REFERENCES "spk"."kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spk"."spk_document" ADD CONSTRAINT "spk_document_mitra_id_fkey" FOREIGN KEY ("mitra_id") REFERENCES "spk"."mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
