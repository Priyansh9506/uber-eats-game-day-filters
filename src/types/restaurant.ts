export type PriceBand = '$' | '$$' | '$$$' | '$$$$';

/** Ordered cheapest → priciest; index + 1 is the source sheet's price_tier. */
export const PRICE_BANDS: readonly PriceBand[] = ['$', '$$', '$$$', '$$$$'];

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  deliveryTimeMin: number;
  priceBand: PriceBand;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  rating: number;
}

export type DietaryOption = 'vegetarian' | 'vegan' | 'glutenFree';

export interface FilterState {
  maxDelivery: 20 | 30 | 45 | null; // null = nothing selected
  priceBands: PriceBand[]; // [] = nothing selected
  dietary: DietaryOption[]; // [] = nothing selected
  minRating: 4.0 | 4.5 | null; // null = nothing selected
}

export const EMPTY_FILTERS: FilterState = {
  maxDelivery: null,
  priceBands: [],
  dietary: [],
  minRating: null,
};

export function isPriceBand(value: unknown): value is PriceBand {
  return typeof value === 'string' && (PRICE_BANDS as readonly string[]).includes(value);
}
