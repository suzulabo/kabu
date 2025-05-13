import { run, type CreateRunner } from './runner';

export const createMoneybuRunner: CreateRunner = (context) => {
  return async () => {
    const page = await context.newPage();
    await page.goto('https://jpx.cloud.qri.jp/tosyo-moneybu/');

    const downloadPromise = page.waitForEvent('download');
    await page.getByText('全件csv出力').click();
    const download = await downloadPromise;
    await download.saveAs('data/money-bu_etf.csv');
  };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await run([createMoneybuRunner]);
}
