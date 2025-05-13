import { writeFile } from 'node:fs/promises';
import { run, type CreateRunner } from './runner';

export const createMonexRunner: CreateRunner = (context) => {
  return async () => {
    const page = await context.newPage();

    await page.goto('https://mxp2.monex.co.jp/pc/servlet/ITS/stkloan/LendStkBonusDescDispGuest');

    const fragments = [];

    for (;;) {
      fragments.push(await page.locator('table.table-style01 tbody').innerText());

      const next = page.getByText('次へ ＞');
      if (!(await next.first().getAttribute('href'))) {
        break;
      }
      await next.first().click();
      await page.waitForLoadState('networkidle');
    }

    const output = fragments
      .join('\n')
      .split('\n')
      .filter((line) => !line.trim().startsWith('銘柄コード'))
      .join('\n');

    await writeFile('data/monex_kashikabu.csv', output, 'utf8');

    return;
  };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await run([createMonexRunner]);
}
