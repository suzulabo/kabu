import { parse } from 'csv-parse/sync';
import { readFile } from 'node:fs/promises';
import { parseNumber } from '../lib/parseNumber';

export const loadSbiKashikabu = async () => {
  const raw = await readFile('data/sbi_kashikabu.csv');

  const rows = parse(raw, { from: 5, relax_column_count: true }) as string[][];

  return new Map(
    rows.map((row) => {
      const code = row[1];
      if (!code) {
        throw new Error('invalid code');
      }
      if (row[3] === '-') {
        return ['', 0];
      }
      const rate = parseNumber(row[3]);
      return [code, rate];
    }),
  );
};

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(await loadSbiKashikabu());
}
