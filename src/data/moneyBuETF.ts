import { parse } from 'csv-parse/sync';
import { readFile } from 'node:fs/promises';

export const loadMoneyBuETF = async () => {
  const raw = await readFile('data/money-bu_etf.csv');

  const rows = parse(raw, { from: 3, relax_column_count: true }) as string[][];

  return new Map(
    rows.map((row) => {
      const code = row[0];
      if (!code) {
        throw new Error('invalid code');
      }
      const listingDate = row[8];
      if (!listingDate) {
        throw new Error('invalid listingDate');
      }
      return [code, { listingDate }];
    }),
  );
};

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(await loadMoneyBuETF());
}
