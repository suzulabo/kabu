import { writeFile } from 'node:fs/promises';
import { run, type CreateRunner } from './runner';

export const createRakutenRunner: CreateRunner = (context) => {
  return async () => {
    const page = await context.newPage();
    await page.goto('https://www.rakuten-sec.co.jp/web/domestic/lending/rate.html');

    await page.getByText('金利検索').click();
    await page.locator('input[name="srate"]').fill('0');
    await page.locator('.submit-search-btn').click();
    const data = await page.locator('#TBL4 tbody').innerText();
    await writeFile('data/rakuten_kashikabu.csv', data, 'utf8');
  };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await run([createRakutenRunner]);
}
