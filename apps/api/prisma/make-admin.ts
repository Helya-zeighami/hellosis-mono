import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

async function main() {
  const identifier = process.argv[2];

  if (!identifier) {
    console.error(
      'Usage: pnpm db:make-admin <phoneNumber>',
    );
    console.error(
      'Example: pnpm db:make-admin +15551234567',
    );
    process.exit(1);
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.update({
      where: { phoneNumber: identifier },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        phoneNumber: true,
        role: true,
      },
    });

    console.log('User promoted to ADMIN:');
    console.log(JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('Failed to promote user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();