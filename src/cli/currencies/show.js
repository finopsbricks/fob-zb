// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField } from '../utils/format.js';

export async function showCurrencyHandler(argv) {
  const zb = clientFor();
  const c = await zb.currencies.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(c, null, 2));
    return;
  }
  if (!c) {
    console.error(`No currency found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', c.currency_id, w));
  console.log(formatField('Code', c.currency_code, w));
  console.log(formatField('Name', c.currency_name, w));
  console.log(formatField('Symbol', c.currency_symbol, w));
  console.log(formatField('Exchange Rate', c.exchange_rate, w));
  console.log(formatField('Base Currency', c.is_base_currency ? 'yes' : 'no', w));
}
