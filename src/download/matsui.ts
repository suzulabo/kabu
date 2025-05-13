import { buffer } from 'node:stream/consumers';
import { run, type CreateRunner } from './runner';
import { writeFile } from 'node:fs/promises';

const getJSessionId = (url: string) => {
  const match = /jsessionid=([^?;]+)/.exec(url);
  const id = match?.[1];
  if (!id) {
    throw new Error('Missing jsessionid');
  }
  return id;
};

export const createMatsuiRunner: CreateRunner = async (context) => {
  const page = await context.newPage();
  await page.goto('https://www.deal.matsui.co.jp/servlet/ITS/login/MemberLoginEnter');

  return async () => {
    const frameSource = await page.locator('frame[name="GM"]').getAttribute('src');
    if (!frameSource) {
      throw new Error('Missing frameSource');
    }

    const id = getJSessionId(frameSource);

    await page.goto(
      `https://www.deal.matsui.co.jp/servlet/ITS/stock/StkLoanRateHistory;jsessionid=${id}`,
    );

    const downloadPromise = page.waitForEvent('download');
    await page.getByAltText('CSV出力').click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const buf = await buffer(stream);
    const decoder = new TextDecoder('shift-jis');
    const decoded = decoder.decode(buf);
    await writeFile('data/matsui_kashikabu.csv', decoded, 'utf8');

    return;
  };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await run([createMatsuiRunner]);
}
