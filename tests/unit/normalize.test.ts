import { describe, expect, it } from 'vitest';
import { normalize, type RestaurantRecord } from '@/services/restaurants';

const base: RestaurantRecord = {
  id: 1,
  name: 'Test Kitchen',
  cuisine: 'Test',
  deliveryTimeMin: 20,
  priceBand: '$$',
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  rating: 4.2,
};

describe('normalize', () => {
  it('marks vegan restaurants as vegetarian', () => {
    expect(normalize({ ...base, isVegan: true }).isVegetarian).toBe(true);
  });

  it('never marks vegetarian restaurants as vegan (one-way rule)', () => {
    const result = normalize({ ...base, isVegetarian: true });
    expect(result.isVegetarian).toBe(true);
    expect(result.isVegan).toBe(false);
  });

  it('leaves non-vegetarian, non-vegan restaurants unchanged', () => {
    expect(normalize(base)).toEqual(base);
  });

  it('rejects a priceBand that is not one of the four literals', () => {
    expect(() => normalize({ ...base, priceBand: '2' })).toThrow(/invalid priceBand "2"/);
  });
});
