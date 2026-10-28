import rawRestaurants from '@/data/restaurants.json';
import { isPriceBand, type Restaurant } from '@/types/restaurant';

/** Shape of a record in restaurants.json before normalize (JSON imports widen priceBand to string). */
export type RestaurantRecord = Omit<Restaurant, 'priceBand'> & { priceBand: string };

/**
 * The single place dataset rules are applied at load time.
 * - Vegan counts as vegetarian (one-way: vegetarian never implies vegan).
 * - priceBand is narrowed to the PriceBand literal union, failing loudly otherwise.
 */
export function normalize(record: RestaurantRecord): Restaurant {
  if (!isPriceBand(record.priceBand)) {
    throw new Error(`Restaurant ${record.id} has invalid priceBand "${record.priceBand}"`);
  }
  return {
    ...record,
    priceBand: record.priceBand,
    isVegetarian: record.isVegetarian || record.isVegan,
  };
}

export function loadRestaurants(records: readonly RestaurantRecord[] = rawRestaurants): Restaurant[] {
  return records.map(normalize);
}
