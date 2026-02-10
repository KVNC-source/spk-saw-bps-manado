import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // =====================
  // ADMIN USER
  // =====================
  const hashed = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: hashed,
      role: 'ADMIN',
    },
    create: {
      username: 'admin',
      name: 'Administrator',
      password: hashed,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user seeded');

  // =====================
  // MATA ANGGARAN
  // =====================
  const tahun = new Date().getFullYear();

  const mataAnggaran = await prisma.mataAnggaran.upsert({
    where: {
      kode_anggaran_tahun: {
        kode_anggaran: 'MA-001',
        tahun,
      },
    },
    update: {},
    create: {
      kode_anggaran: 'MA-001',
      nama_anggaran: 'Belanja Jasa Mitra Statistik',
      tahun,
      is_active: true,
    },
  });

  console.log('✅ Mata anggaran seeded');

  // =====================
  // KEGIATAN (SAFE SEED)
  // =====================
  const existingKegiatan = await prisma.kegiatan.findFirst({
    where: {
      nama_kegiatan: 'Contoh Kegiatan',
      tahun,
    },
  });

  if (!existingKegiatan) {
    await prisma.kegiatan.create({
      data: {
        nama_kegiatan: 'Contoh Kegiatan',
        tahun,
        jenis_kegiatan: 'SURVEI',
        satuan: 'RUTA',
        tarif_per_satuan: 14000,
        mata_anggaran_id: mataAnggaran.id,
      },
    });

    console.log('✅ Kegiatan seeded');
  } else {
    console.log('ℹ️ Kegiatan already exists');
  }

  console.log('🎉 Seed finished successfully');
}

// ✅ CALL MAIN *AFTER* IT ENDS
main()
  .catch((e) => {
    console.error('❌ SEED FAILED');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
