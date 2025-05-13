import { readFile } from 'node:fs/promises';
import { parse } from 'csv-parse/sync';
import { parseNumber } from '../lib/parseNumber';

export const loadMatsuiKashikabu = async () => {
  const raw = await readFile('data/matsui_kashikabu.csv');

  const rows = parse(raw, { from: 2 }) as string[][];

  return new Map(
    rows.map((row) => {
      const code = row[1]?.slice(0, 4);
      if (!code) {
        throw new Error('invalid code');
      }
      const rate = parseNumber(row[3]);

      return [code, rate] as const;
    }),
  );
};

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(await loadMatsuiKashikabu());
}
