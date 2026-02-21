import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SPK Roles...');

  await prisma.spkRole.createMany({
    data: [
      {
        kode_role: 'ADMIN',
        nama_role: 'Administrator',
      },
      {
        kode_role: 'KETUA_TIM',
        nama_role: 'Ketua Tim',
      },
      {
        kode_role: 'MITRA',
        nama_role: 'Mitra',
      },
    ],
    skipDuplicates: true, // prevents duplicate error
  });

  console.log('✅ SPK Roles seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
