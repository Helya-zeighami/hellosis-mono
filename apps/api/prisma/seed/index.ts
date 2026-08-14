import { main as seedCities } from './cities.seed.js';
import { main as seedInterests } from './interests.seed.js';

async function main() {
  await seedCities();
  await seedInterests();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
