import { describe, expect, it } from 'vitest';
import { EMPTY_FILTERS, isPriceBand, PRICE_BANDS } from '@/types/restaurant';

describe('restaurant types', () => {
  it('EMPTY_FILTERS has every filter in the nothing-selected state', () => {
    expect(EMPTY_FILTERS).toEqual({ maxDelivery: null, priceBands: [], dietary: [], minRating: null });
  });

  it('PRICE_BANDS lists the four dollar-sign literals cheapest first', () => {
    expect(PRICE_BANDS).toEqual(['$', '$$', '$$$', '$$$$']);
  });

  it.each(['', '1', '$$$$$', 'cheap', 2, null])('isPriceBand rejects %j', (value) => {
    expect(isPriceBand(value)).toBe(false);
  });
});
