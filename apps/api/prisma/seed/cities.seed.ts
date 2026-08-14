import 'dotenv/config';
import * as fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

export async function main() {
  const dataPath = fileURLToPath(new URL('./provinces_cities.json', import.meta.url));
  const provinces: Record<string, string[]> = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const uniqueNames = new Set<string>();
  for (const cityName of Object.values(provinces).flat()) {
    uniqueNames.add(cityName);
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const existing = new Set(
      (await prisma.city.findMany({ select: { name: true } })).map((city) => city.name),
    );

    const cities = [...uniqueNames]
      .filter((name) => !existing.has(name))
      .map((name) => ({ name, country: 'IR' }));

    if (cities.length === 0) {
      console.log('Cities are already up to date');
      return;
    }

    const result = await prisma.city.createMany({ data: cities });
    console.log(`Seeded ${result.count} cities`);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
