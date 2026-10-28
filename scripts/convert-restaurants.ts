/**
 * Converts the raw restaurant spreadsheet in db/ into src/data/restaurants.json.
 * Exits non-zero (and writes nothing) if any row fails validation.
 *
 *   npm run convert [-- <input.xlsx> <output.json>]
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { loadRestaurantSheet } from './restaurant-sheet';

const DEFAULT_INPUT = 'db/Uber Eats Game-Day Restaurant Set (40 listings).xlsx';
const DEFAULT_OUTPUT = 'src/data/restaurants.json';

async function main() {
  const [input = DEFAULT_INPUT, output = DEFAULT_OUTPUT] = process.argv.slice(2);
  const restaurants = await loadRestaurantSheet(resolve(input));

  await mkdir(dirname(resolve(output)), { recursive: true });
  await writeFile(resolve(output), `${JSON.stringify(restaurants, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${restaurants.length} restaurants from ${input} to ${output}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
