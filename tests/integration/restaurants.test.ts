import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { loadRestaurants } from '@/services/restaurants';
import { PRICE_BANDS } from '@/types/restaurant';
import { loadRestaurantSheet } from '../../scripts/restaurant-sheet';

const XLSX_PATH = 'db/Uber Eats Game-Day Restaurant Set (40 listings).xlsx';
const restaurants = loadRestaurants();
const byName = (name: string) => {
  const match = restaurants.find((r) => r.name === name);
  if (!match) throw new Error(`No restaurant named ${name}`);
  return match;
};

describe('restaurant dataset', () => {
  it('loads all 40 restaurants', () => {
    expect(restaurants).toHaveLength(40);
  });

  it('gives every restaurant a priceBand that is one of the four literals', () => {
    for (const r of restaurants) expect(PRICE_BANDS).toContain(r.priceBand);
  });

  it('treats Sprout & Seed as vegetarian after normalize (vegan in the sheet)', () => {
    const sprout = byName('Sprout & Seed');
    expect(sprout.isVegan).toBe(true);
    expect(sprout.isVegetarian).toBe(true);
  });

  it('does not treat Slice & Fire Pizza as vegan', () => {
    const slice = byName('Slice & Fire Pizza');
    expect(slice.isVegetarian).toBe(true);
    expect(slice.isVegan).toBe(false);
  });

  it('has no vegan restaurant that is not also vegetarian', () => {
    expect(restaurants.filter((r) => r.isVegan && !r.isVegetarian)).toEqual([]);
  });

  it('restaurants.json is in sync with the xlsx in db/', async () => {
    const fromSheet = await loadRestaurantSheet(XLSX_PATH);
    const committed = JSON.parse(await readFile('src/data/restaurants.json', 'utf8'));
    expect(committed).toEqual(fromSheet);
  });
});
