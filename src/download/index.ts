import { readFile, writeFile } from 'node:fs/promises';
import readline from 'node:readline/promises';
import { buffer } from 'node:stream/consumers';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const sbiPage = await context.newPage();

const login = async () => {
  await sbiPage.goto('https://site3.sbisec.co.jp/ETGate/');

  await rl.question('Input Enter...');
};

const downloadSbiKashikabu = async () => {
  await sbiPage.goto(
    'https://site3.sbisec.co.jp/ETGate/?OutSide=on&_ControlID=WPLETsmR001Control&_DataStoreID=DSWPLETsmR001Control&_PageID=WPLETsmR001Sdtl12&_ActionID=NoActionID&sw_page=LndStk&cat1=home&cat2=none&sw_param1=&sw_param2=lndstk_ratelist&getFlg=on',
  );

  await sbiPage.waitForURL('https://site0.sbisec.co.jp/marble/account/japan/ratelist.do?');
  const button = sbiPage.locator('a:text("CSVダウンロード↓")');

  const downloadPromise = sbiPage.waitForEvent('download');
  await button.click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const buf = await buffer(stream);
  const decoder = new TextDecoder('shift-jis');
  const decoded = decoder.decode(buf);
  await writeFile('data/sbi_kashikabu.csv', decoded, 'utf8');
};

const downloadRakutenKashikabu = async () => {
  const page = await context.newPage();
  await page.goto('https://www.rakuten-sec.co.jp/web/domestic/lending/rate.html');

  await page.getByText('金利検索').click();
  await page.locator('input[name="srate"]').fill('0');
  await page.locator('.submit-search-btn').click();
  const data = await page.locator('#TBL4 tbody').innerText();
  await writeFile('data/rakuten_kashikabu.csv', data, 'utf8');
};

const downloadSbiETF = async () => {
  const page = await context.newPage();
  await page.goto('https://site0.sbisec.co.jp/marble/domestic/etfetn/etfetnsearch.do');

  const downloadPromise = page.waitForEvent('download');
  await page.getByText('CSVダウンロード').click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const buf = await buffer(stream);
  const decoder = new TextDecoder('shift-jis');
  const decoded = decoder.decode(buf);
  await writeFile('data/sbi_etf.csv', decoded, 'utf8');
};

const downloadMoneyBuETF = async () => {
  const page = await context.newPage();
  await page.goto('https://jpx.cloud.qri.jp/tosyo-moneybu/');

  const downloadPromise = page.waitForEvent('download');
  await page.getByText('全件csv出力').click();
  const download = await downloadPromise;
  await download.saveAs('data/money-bu_etf.csv');
};

const main = async () => {
  try {
    try {
      type Cookies = Parameters<(typeof context)['addCookies']>[0];
      const cookies = JSON.parse(await readFile('data/cookies.json', 'utf8')) as Cookies;
      await context.addCookies(cookies);
    } catch {
      //
    }

    await login();

    await Promise.all([
      downloadSbiKashikabu(),
      downloadRakutenKashikabu(),
      downloadSbiETF(),
      downloadMoneyBuETF(),
    ]);

    await rl.question('Input Enter...');
  } finally {
    const cookies = await context.cookies();
    await writeFile('data/cookies.json', JSON.stringify(cookies));
    rl.close();
    await browser.close();
  }
};

await main();

//https://www.deal.matsui.co.jp/servlet/ITS/stock/StkLoanRateHistory;jsessionid=6520e8afd4bbf334df0362d30abe4693f450611a
//https://mxp2.monex.co.jp/pc/servlet/ITS/stkloan/LendStkBonusDescDispGuest
