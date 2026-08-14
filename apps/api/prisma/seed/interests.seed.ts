import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

const interests = [
  'Drawing',
  'Painting',
  'Photography',
  'Writing',
  'Poetry',
  'Reading',
  'Languages',
  'Psychology',
  'History',
  'Philosophy',
  'Science',
  'Technology',
  'Programming',
  'Singing',
  'Dancing',
  'K-Pop',
  'J-Pop',
  'Rock',
  'Pop Music',
  'Playing Instruments',
  'Movies',
  'TV Shows',
  'Anime',
  'Manga',
  'Gaming',
  'Board Games',
  'Podcasts',
  'Gym',
  'Running',
  'Walking',
  'Yoga',
  'Pilates',
  'Swimming',
  'Hiking',
  'Cycling',
  'Cooking',
  'Baking',
  'Coffee',
  'Tea',
  'Travel',
  'Camping',
  'Gardening',
  'Pets',
  'Self Improvement',
  'Journaling',
  'Meditation',
  'Fantasy',
  'Horror',
  'Mystery',
  'True Crime',
  'Goth',
  'Cosplay',
  'Museums',
  'Book Clubs',
  'Making Friends',
];

export async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const result = await prisma.interest.createMany({
      data: interests.map((name) => ({ name })),
      skipDuplicates: true,
    });
    console.log(`Seeded ${result.count} interests`);
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
