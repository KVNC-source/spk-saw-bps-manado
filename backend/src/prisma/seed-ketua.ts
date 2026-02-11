import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const emails = [
  'norma@bps.go.id',
  'miaw_miranti@bps.go.id',
  'arista.belawan@bps.go.id',
  'sasta@bps.go.id',
  'elriniwuisan@bps.go.id',
  'natalia.ondang@bps.go.id',
  'nawir@bps.go.id',
  'frisca.saragih@bps.go.id',
  'vivisumampouw@bps.go.id',
  'rahmadi@bps.go.id',
  'rahadita@bps.go.id',
  'beliana.puspita@bps.go.id',
  'weny@bps.go.id',
  'farhan@bps.go.id',
  'defi.astuti@bps.go.id',
  'maskhur.solikhudin@bps.go.id',
  'santi.putri@bps.go.id',
];

async function main() {
  for (const email of emails) {
    const username = email.split('@')[0];
    const passwordHash = await bcrypt.hash(`${username}123`, 10);

    await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        id: randomUUID(),
        username,
        name: username,
        password: passwordHash,
        role: Role.KETUA_TIM,
      },
    });

    console.log(`✔ Created: ${username}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
