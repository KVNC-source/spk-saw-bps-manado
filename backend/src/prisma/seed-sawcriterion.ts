import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SAW Criteria...');

  await prisma.sawCriterion.createMany({
    data: [
      {
        name: 'Ketepatan Waktu',
        key: 'ketepatan_waktu',
        weight: 0.3,
        type: 'benefit',
      },
      {
        name: 'Kualitas',
        key: 'kualitas',
        weight: 0.4,
        type: 'benefit',
      },
      {
        name: 'Komunikasi',
        key: 'komunikasi',
        weight: 0.3,
        type: 'benefit',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ SAW Criteria seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
