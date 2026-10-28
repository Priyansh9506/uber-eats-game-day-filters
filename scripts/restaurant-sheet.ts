import ExcelJS from 'exceljs';
import { PRICE_BANDS, type Restaurant } from '../src/types/restaurant';

export const EXPECTED_COLUMNS = [
  'id',
  'name',
  'cuisine',
  'delivery_time_min',
  'price_tier',
  'is_vegetarian',
  'is_vegan',
  'is_gluten_free',
  'rating',
] as const;

export const EXPECTED_ROW_COUNT = 40;

type Column = (typeof EXPECTED_COLUMNS)[number];
type RawRow = Record<Column, string>;

export class SheetValidationError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Restaurant sheet failed validation (${problems.length} problem(s)):\n  - ${problems.join('\n  - ')}`);
    this.name = 'SheetValidationError';
  }
}

/** Reads the first worksheet into header + data rows of trimmed cell text. */
export async function readSheet(xlsxPath: string): Promise<string[][]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(xlsxPath);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new SheetValidationError([`${xlsxPath} contains no worksheets`]);

  const rows: string[][] = [];
  for (let r = 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const cells: string[] = [];
    for (let c = 1; c <= Math.max(row.cellCount, EXPECTED_COLUMNS.length); c++) {
      cells.push(row.getCell(c).text.trim());
    }
    rows.push(cells);
  }
  return rows;
}

/**
 * Validates every row and maps it to a Restaurant. Dietary flags are kept exactly
 * as the sheet states them; vegan ⇒ vegetarian is applied later by normalize().
 * Collects all problems before throwing so one run reports everything wrong.
 */
export function parseRows(rows: string[][]): Restaurant[] {
  const problems: string[] = [];
  const [header = [], ...body] = rows;

  const headerCells = header.filter((cell) => cell !== '');
  if (headerCells.join(',') !== EXPECTED_COLUMNS.join(',')) {
    throw new SheetValidationError([
      `header must be exactly [${EXPECTED_COLUMNS.join(', ')}], got [${headerCells.join(', ')}]`,
    ]);
  }

  const restaurants: Restaurant[] = [];
  const seenIds = new Map<number, number>();
  const seenNames = new Map<string, number>();

  body.forEach((cells, index) => {
    const line = index + 2; // 1-based, after the header row
    const at = (msg: string) => problems.push(`row ${line}: ${msg}`);

    if (cells.every((cell) => cell === '')) {
      at('is blank');
      return;
    }
    const extra = cells.slice(EXPECTED_COLUMNS.length).filter((cell) => cell !== '');
    if (extra.length > 0) at(`has unexpected values beyond column ${EXPECTED_COLUMNS.length}: ${extra.join(', ')}`);

    const raw = Object.fromEntries(EXPECTED_COLUMNS.map((col, i) => [col, cells[i] ?? ''])) as RawRow;

    const int = (col: Column, min: number, max: number): number => {
      const value = raw[col];
      if (!/^-?\d+$/.test(value)) {
        at(`${col} must be an integer, got "${value}"`);
        return NaN;
      }
      const n = Number(value);
      if (n < min || n > max) at(`${col} must be between ${min} and ${max}, got ${n}`);
      return n;
    };

    const text = (col: Column): string => {
      if (raw[col] === '') at(`${col} is empty`);
      return raw[col];
    };

    const bool = (col: Column): boolean => {
      const value = raw[col].toLowerCase();
      if (value !== 'true' && value !== 'false') at(`${col} must be true or false, got "${raw[col]}"`);
      return value === 'true';
    };

    const rating = (): number => {
      const value = raw.rating;
      if (!/^\d(\.\d)?$/.test(value)) {
        at(`rating must be a number with at most one decimal, got "${value}"`);
        return NaN;
      }
      const n = Number(value);
      if (n < 0 || n > 5) at(`rating must be between 0 and 5, got ${n}`);
      return n;
    };

    const restaurant: Restaurant = {
      id: int('id', 1, Number.MAX_SAFE_INTEGER),
      name: text('name'),
      cuisine: text('cuisine'),
      deliveryTimeMin: int('delivery_time_min', 1, 240),
      priceBand: PRICE_BANDS[int('price_tier', 1, PRICE_BANDS.length) - 1],
      isVegetarian: bool('is_vegetarian'),
      isVegan: bool('is_vegan'),
      isGlutenFree: bool('is_gluten_free'),
      rating: rating(),
    };

    if (seenIds.has(restaurant.id)) at(`duplicate id ${restaurant.id} (first seen on row ${seenIds.get(restaurant.id)})`);
    seenIds.set(restaurant.id, line);
    const nameKey = restaurant.name.toLowerCase();
    if (nameKey && seenNames.has(nameKey)) at(`duplicate name "${restaurant.name}" (first seen on row ${seenNames.get(nameKey)})`);
    seenNames.set(nameKey, line);

    restaurants.push(restaurant);
  });

  if (body.length !== EXPECTED_ROW_COUNT) {
    problems.push(`expected ${EXPECTED_ROW_COUNT} data rows, got ${body.length}`);
  }

  if (problems.length > 0) throw new SheetValidationError(problems);
  return restaurants;
}

export async function loadRestaurantSheet(xlsxPath: string): Promise<Restaurant[]> {
  return parseRows(await readSheet(xlsxPath));
}
