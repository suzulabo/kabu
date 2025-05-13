import { buffer } from 'node:stream/consumers';
import { run, type CreateRunner } from './runner';
import { writeFile } from 'node:fs/promises';

export const createSbiRunner: CreateRunner = async (context) => {
  const page = await context.newPage();
  await page.goto('https://site3.sbisec.co.jp/ETGate/');

  return async () => {
    await page.goto(
      'https://site3.sbisec.co.jp/ETGate/?OutSide=on&_ControlID=WPLETsmR001Control&_DataStoreID=DSWPLETsmR001Control&_PageID=WPLETsmR001Sdtl12&_ActionID=NoActionID&sw_page=LndStk&cat1=home&cat2=none&sw_param1=&sw_param2=lndstk_ratelist&getFlg=on',
    );

    await page.waitForURL('https://site0.sbisec.co.jp/marble/account/japan/ratelist.do?');
    const button = page.locator('a:text("CSVダウンロード↓")');

    const downloadPromise = page.waitForEvent('download');
    await button.click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const buf = await buffer(stream);
    const decoder = new TextDecoder('shift-jis');
    const decoded = decoder.decode(buf);
    await writeFile('data/sbi_kashikabu.csv', decoded, 'utf8');
  };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await run([createSbiRunner]);
}
