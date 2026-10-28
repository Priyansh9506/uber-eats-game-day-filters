import { describe, expect, it } from 'vitest';
import { EXPECTED_COLUMNS, parseRows, SheetValidationError } from '../../scripts/restaurant-sheet';

const header = [...EXPECTED_COLUMNS];
const validRow = (id: number) => [String(id), `Place ${id}`, 'Thai', '25', '2', 'true', 'false', 'false', '4.5'];
const sheet = (...rows: string[][]) => [header, ...rows];
const fortyRows = () => Array.from({ length: 40 }, (_, i) => validRow(i + 1));

function problemsFor(rows: string[][]): string[] {
  try {
    parseRows(rows);
  } catch (error) {
    if (error instanceof SheetValidationError) return error.problems;
    throw error;
  }
  throw new Error('expected parseRows to throw');
}

describe('parseRows', () => {
  it('maps every column of a valid row', () => {
    const [first] = parseRows(sheet(...fortyRows()));
    expect(first).toEqual({
      id: 1,
      name: 'Place 1',
      cuisine: 'Thai',
      deliveryTimeMin: 25,
      priceBand: '$$',
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      rating: 4.5,
    });
  });

  it('rejects a renamed or reordered header', () => {
    const rows = sheet(...fortyRows());
    rows[0] = [...header].reverse();
    expect(problemsFor(rows)[0]).toMatch(/header must be exactly/);
  });

  it('rejects the wrong number of rows', () => {
    expect(problemsFor(sheet(validRow(1)))).toContain('expected 40 data rows, got 1');
  });

  it.each([
    ['price_tier', 4, '5', /price_tier must be between 1 and 4/],
    ['price_tier', 4, '$$', /price_tier must be an integer/],
    ['delivery_time_min', 3, 'soon', /delivery_time_min must be an integer/],
    ['is_vegan', 6, 'yes', /is_vegan must be true or false/],
    ['rating', 8, '4.65', /rating must be a number with at most one decimal/],
    ['rating', 8, '7.0', /rating must be between 0 and 5/],
    ['name', 1, '', /name is empty/],
  ])('rejects a bad %s value', (_column, index, value, message) => {
    const rows = fortyRows();
    rows[9][index] = value;
    expect(problemsFor(sheet(...rows))).toEqual([expect.stringMatching(message)]);
    expect(problemsFor(sheet(...rows))[0]).toMatch(/^row 11:/);
  });

  it('rejects duplicate ids and names', () => {
    const rows = fortyRows();
    rows[5] = validRow(1);
    const problems = problemsFor(sheet(...rows));
    expect(problems).toContain('row 7: duplicate id 1 (first seen on row 2)');
    expect(problems).toContain('row 7: duplicate name "Place 1" (first seen on row 2)');
  });

  it('rejects blank rows', () => {
    const rows = fortyRows();
    rows[39] = Array(9).fill('');
    expect(problemsFor(sheet(...rows))).toEqual(['row 41: is blank']);
  });

  it('reports every problem at once instead of stopping at the first', () => {
    const rows = fortyRows();
    rows[0][4] = '9';
    rows[1][8] = 'great';
    expect(problemsFor(sheet(...rows))).toHaveLength(2);
  });
});
