import { readFile, writeFile } from 'node:fs/promises';
import readline from 'node:readline/promises';
import type { BrowserContext } from 'playwright';
import { chromium } from 'playwright';

export type CreateRunner = (
  context: BrowserContext,
) => (() => Promise<void>) | Promise<() => Promise<void>>;

export const run = async (creators: CreateRunner[]) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  type Cookies = Parameters<(typeof context)['addCookies']>[0];
  const cookies = JSON.parse(await readFile('data/cookies.json', 'utf8')) as Cookies;
  await context.addCookies(cookies);

  const runners = await Promise.all(
    creators.map((v) => {
      return v(context);
    }),
  );

  await rl.question('[Starting] Input Enter...');

  try {
    await Promise.all(
      runners.map((v) => {
        return v();
      }),
    );
    await rl.question('[Finished] Input Enter...');
  } finally {
    const cookies = await context.cookies();
    await writeFile('data/cookies.json', JSON.stringify(cookies));
    rl.close();
    await browser.close();
  }
};
