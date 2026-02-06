import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
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

  console.log('✅ Admin reset: admin / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
