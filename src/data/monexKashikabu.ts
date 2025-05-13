import { parse } from 'csv-parse/sync';
import { readFile } from 'node:fs/promises';
import { parseNumber } from '../lib/parseNumber';

export const loadMonexKashikabu = async () => {
  const raw = await readFile('data/monex_kashikabu.csv');

  const rows = parse(raw, { delimiter: '\t' }) as string[][];

  return new Map(
    rows.map((row) => {
      const code = row[0];
      if (!code) {
        throw new Error('invalid code');
      }
      const rate = parseNumber(row[2]);
      return [code, rate];
    }),
  );
};

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(await loadMonexKashikabu());
}
