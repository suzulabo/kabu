import { addYears, parse } from 'date-fns';
import { writeFile } from 'node:fs/promises';
import { loadMatsuiKashikabu } from '../data/matsuiKashikabu';
import { loadMonexKashikabu } from '../data/monexKashikabu';
import { loadMoneyBuETF } from '../data/moneyBuETF';
import { loadRakutenKashikabu } from '../data/rakutenKashikabu';
import { loadSbiETF } from '../data/sbiETF';
import { loadSbiKashikabu } from '../data/sbiKashikabu';

type ETFValue = NonNullable<ReturnType<Awaited<ReturnType<typeof loadSbiETF>>['get']>>;

const etfMap = await loadSbiETF();
const listingDateMap = await loadMoneyBuETF();
const kashiKabuMaps = {
  sbi: await loadSbiKashikabu(),
  rakuten: await loadRakutenKashikabu(),
  matsui: await loadMatsuiKashikabu(),
  monex: await loadMonexKashikabu(),
};

const listingThreshold = addYears(new Date(), -1.1);

const getKashikabuRate = (code: string) => {
  const rates = [
    ['SBI', kashiKabuMaps.sbi.get(code)],
    ['楽天', kashiKabuMaps.rakuten.get(code)],
    ['松井', kashiKabuMaps.matsui.get(code)],
    ['MONEX', kashiKabuMaps.monex.get(code)],
  ] as const;

  let maxRate = 0;
  const companies = [];
  for (const [name, rate] of rates) {
    if (rate !== undefined) {
      if (rate > maxRate) {
        maxRate = rate;
        companies.splice(0);
        companies.push(name);
      } else if (rate === maxRate) {
        companies.push(name);
      }
    }
  }
  return { rate: maxRate, companies: companies.join(',') };
};

const dividendYieldReferenceMap = new Map([
  ['354A', '1489'],
  ['315A', '1615'],
]);
const expectedDividendMap = new Map([
  ['235A', 30],
  ['210A', 65],
]);

const resolveDividendYield = (code: string) => {
  const codeReference = dividendYieldReferenceMap.get(code) ?? code;

  const etf = etfMap.get(codeReference);
  if (!etf) {
    throw new Error('unexpected');
  }

  const expectedDividend = expectedDividendMap.get(code);
  if (expectedDividend) {
    return (expectedDividend / etf.price) * 100;
  }

  return etf.dividendYield;
};

const genRow = (code: string, etf: ETFValue) => {
  const listingDateString = listingDateMap.get(code)?.listingDate;
  if (!listingDateString) {
    return [code, etf.name, '#'];
  }
  const listingDate = parse(listingDateString, 'yyyyMMdd', new Date());

  const newlyListed = listingDate > listingThreshold ? '*' : '';

  const dividendYield = resolveDividendYield(code);

  const kashikabu = getKashikabuRate(code);

  return [
    code,
    etf.name,
    etf.category,
    dividendYield,
    etf.fee,
    kashikabu.rate,
    kashikabu.companies,
    dividendYield - etf.fee + kashikabu.rate,
    listingDateString + newlyListed,
    `https://money-bu-jpx.com/search/${code}/`,
  ];
};

const main = async () => {
  const lines = [];

  lines.push(
    [
      'コード',
      '名前',
      'カテゴリ',
      '配当',
      '報酬',
      '貸株',
      '貸株会社',
      '利回り',
      '上場日',
      'URL',
    ].join('\t'),
  );
  for (const [code, etf] of etfMap.entries()) {
    lines.push(genRow(code, etf).join('\t'));
  }

  const output = lines.join('\n');

  await writeFile('data/etf-kashikabu.tsv', output, 'utf8');

  console.log(output);
};

await main();
