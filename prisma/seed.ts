import { PrismaClient, Role } from '@prisma/client';
import { EncryptService } from '../src/infrastructure/encrypt/service/encrypt.service';
import { ConfigService } from '@nestjs/config';

const prisma = new PrismaClient();

async function main() {
  const configService = new ConfigService();
  const encryptService = new EncryptService(configService);

  const hashedPassword = await encryptService.hash('password');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@email.com' },
    update: {},
    create: {
      email: 'admin@email.com',
      firstName: 'chang su',
      lastName: 'lee',
      role: Role.ADMIN,
      password: hashedPassword,
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@email.com' },
    update: {},
    create: {
      email: 'seller@email.com',
      firstName: 'chang su',
      lastName: 'lee',
      role: Role.SELLER,
      password: hashedPassword,
    },
  });

  const place = await prisma.place.upsert({
    where: { id: '6a0e0a7b-6b5b-4c4b-9b0f-0f4b7b1b5f6d' },
    update: {},
    create: {
      id: '6a0e0a7b-6b5b-4c4b-9b0f-0f4b7b1b5f6d',
      city: '서울시',
      district: '강남구',
      street: '봉은사로',
      streetNumber: 120,
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
