/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { PrismaClient, Role, PeriodeStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding system & SPK data...');

  // =========================
  // 1️⃣ USERS
  // =========================
  const adminPassword = await bcrypt.hash('admin123', 10);
  const mitraPassword = await bcrypt.hash('mitra123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@sibemi.local' },
    update: {},
    create: {
      email: 'admin@sibemi.local',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const mitraUsers = [
    {
      email: 'mitra1@sibemi.local',
      nama: 'Mitra A',
      bank: 'BRI',
      rekening: '111111',
    },
    {
      email: 'mitra2@sibemi.local',
      nama: 'Mitra B',
      bank: 'BNI',
      rekening: '222222',
    },
    {
      email: 'mitra3@sibemi.local',
      nama: 'Mitra C',
      bank: 'Mandiri',
      rekening: '333333',
    },
  ];

  for (const m of mitraUsers) {
    await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        email: m.email,
        password: mitraPassword,
        role: Role.MITRA,
        mitra: {
          create: {
            nama: m.nama,
            alamat: 'Manado',
            bank: m.bank,
            noRekening: m.rekening,
          },
        },
      },
    });
  }

  const mitraList = await prisma.mitra.findMany();
  const mitraMap = new Map<string, string>(
    mitraList.map((m): [string, string] => [m.nama, m.id]),
  );

  // =========================
  // 2️⃣ PERIODE
  // =========================
  const periode = await prisma.periode.upsert({
    where: {
      bulan_tahun: {
        bulan: 1,
        tahun: 2025,
      },
    },
    update: {},
    create: {
      bulan: 1,
      tahun: 2025,
      status: PeriodeStatus.OPEN,
    },
  });

  // =========================
  // 3️⃣ KRITERIA (SAW)
  // =========================
  const kriteriaSeed = [
    { nama: 'Jumlah Beban Kerja', bobot: 0.4, tipe: 'BENEFIT' },
    { nama: 'Ketepatan Waktu', bobot: 0.3, tipe: 'BENEFIT' },
    { nama: 'Kompleksitas Tugas', bobot: 0.3, tipe: 'COST' },
  ] as const;

  for (const k of kriteriaSeed) {
    await prisma.kriteria.upsert({
      where: { nama: k.nama },
      update: {
        bobot: k.bobot,
        tipe: k.tipe,
      },
      create: {
        nama: k.nama,
        bobot: k.bobot,
        tipe: k.tipe,
      },
    });
  }

  const kriteriaList = await prisma.kriteria.findMany();
  const kriteriaMap = new Map<string, string>(
    kriteriaList.map((k): [string, string] => [k.nama, k.id]),
  );

  // =========================
  // 4️⃣ PENILAIAN SPK (GOLDEN DATASET)
  // =========================
  const penilaianData = [
    // Mitra A
    { mitra: 'Mitra A', kriteria: 'Jumlah Beban Kerja', nilai: 80 },
    { mitra: 'Mitra A', kriteria: 'Ketepatan Waktu', nilai: 70 },
    { mitra: 'Mitra A', kriteria: 'Kompleksitas Tugas', nilai: 5 },

    // Mitra B
    { mitra: 'Mitra B', kriteria: 'Jumlah Beban Kerja', nilai: 90 },
    { mitra: 'Mitra B', kriteria: 'Ketepatan Waktu', nilai: 60 },
    { mitra: 'Mitra B', kriteria: 'Kompleksitas Tugas', nilai: 6 },

    // Mitra C
    { mitra: 'Mitra C', kriteria: 'Jumlah Beban Kerja', nilai: 85 },
    { mitra: 'Mitra C', kriteria: 'Ketepatan Waktu', nilai: 75 },
    { mitra: 'Mitra C', kriteria: 'Kompleksitas Tugas', nilai: 4 },
  ];

  for (const p of penilaianData) {
    await prisma.penilaianSPK.upsert({
      where: {
        mitraId_kriteriaId_periodeId: {
          mitraId: mitraMap.get(p.mitra)!,
          kriteriaId: kriteriaMap.get(p.kriteria)!,
          periodeId: periode.id,
        },
      },
      update: { nilai: p.nilai },
      create: {
        mitraId: mitraMap.get(p.mitra)!,
        kriteriaId: kriteriaMap.get(p.kriteria)!,
        periodeId: periode.id,
        nilai: p.nilai,
      },
    });
  }

  console.log('✅ System & SPK seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
