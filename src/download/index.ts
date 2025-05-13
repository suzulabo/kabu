import { createMatsuiRunner } from './matsui';
import { createMonexRunner } from './monex';
import { createMoneybuRunner } from './moneybu';
import { createRakutenRunner } from './rakuten';
import { run } from './runner';
import { createSbiRunner } from './sbi';

await run([
  createMoneybuRunner,
  createRakutenRunner,
  createSbiRunner,
  createMonexRunner,
  createMatsuiRunner,
]);
