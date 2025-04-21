import { XMLParser } from 'fast-xml-parser';
import { readFile } from 'node:fs/promises';
import { parseNumber } from '../lib/parseNumber';

type MonexEtfXML = {
  MONEX: {
    Fund: [
      {
        STOCK_CODE: number;
        DIV_LIST: {
          DIV?:
            | [
                {
                  '#text': string;
                  '@_DATE_YMD': string;
                },
              ]
            | {
                '#text': string;
                '@_DATE_YMD': string;
              };
        };
      },
    ];
  };
};

export const loadMonexETF = async () => {
  const decoder = new TextDecoder('shift-jis');
  const raw = await readFile('data/monex_etf.xml');
  const text = decoder.decode(raw);

  const parser = new XMLParser({ ignoreAttributes: false });
  const xml = parser.parse(text) as MonexEtfXML;

  const x = xml.MONEX.Fund.map((fund) => {
    const code = fund.STOCK_CODE.toString();

    const dividends = (() => {
      const DIV = fund.DIV_LIST.DIV;

      if (!DIV) {
        return [];
      }

      if (!Array.isArray(DIV)) {
        const date = DIV['@_DATE_YMD'];
        const value = parseNumber(DIV['#text']);
        return [{ date, value }];
      }

      return DIV.map((div) => {
        const date = div['@_DATE_YMD'];
        const value = parseNumber(div['#text']);
        return {
          date,
          value,
        };
      });
    })();

    return [code, { dividends }] as const;
  });

  return new Map(x);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(await loadMonexETF());
}

// https://apl.wealthadvisor.jp/webasp/monex/jp_etf/data/MONEX_jp_etf.xml
