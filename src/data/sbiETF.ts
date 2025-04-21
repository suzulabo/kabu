import { parse } from 'csv-parse/sync';
import { readFile } from 'node:fs/promises';
import { parseNumber } from '../lib/parseNumber';

export const loadSbiETF = async () => {
  const raw = await readFile('data/sbi_etf.csv');

  const rows = parse(raw, { from: 5, relax_column_count: true }) as string[][];

  return new Map(
    rows.map((row) => {
      const code = row[1];
      if (!code) {
        throw new Error('invalid code');
      }
      const name = row[2];
      if (!name) {
        throw new Error('invalid name');
      }
      const category = row[3];
      if (!category) {
        throw new Error('invalid category');
      }
      const price = row[5] === '-' ? -1 : parseNumber(row[5]);
      const dividendYield = row[9] === '-' ? -1 : parseNumber(row[9]);
      const fee = row[11] === '-' ? -1 : parseNumber(row[11]) * 1.1;
      return [code, { name, category, price, dividendYield, fee }];
    }),
  );
};

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(await loadSbiETF());
}
