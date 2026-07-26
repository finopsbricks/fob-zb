// @ts-check
import { clientFor } from '../_helpers.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const PUBLIC_FIELDS = [
  'currency_id', 'currency_code', 'currency_name', 'currency_symbol', 'exchange_rate', 'is_base_currency',
];
const DEFAULT_FIELDS = ['currency_id', 'currency_code', 'currency_name', 'currency_symbol', 'is_base_currency'];

const COLUMNS = {
  currency_id:      { header: 'ID',     align: 'left',  render: (c) => String(c.currency_id ?? ''),     raw: (c) => c.currency_id },
  currency_code:    { header: 'CODE',   align: 'left',  render: (c) => c.currency_code ?? '',           raw: (c) => c.currency_code },
  currency_name:    { header: 'NAME',   align: 'left',  render: (c) => c.currency_name ?? '',           raw: (c) => c.currency_name },
  currency_symbol:  { header: 'SYMBOL', align: 'left',  render: (c) => c.currency_symbol ?? '',         raw: (c) => c.currency_symbol },
  exchange_rate:    { header: 'RATE',   align: 'right', render: (c) => String(c.exchange_rate ?? ''),   raw: (c) => c.exchange_rate },
  is_base_currency: { header: 'BASE',   align: 'left',  render: (c) => (c.is_base_currency ? 'yes' : ''), raw: (c) => c.is_base_currency },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

export async function listCurrenciesHandler(argv) {
  const zb = clientFor();
  await runList({
    argv,
    selector,
    jsonKey: 'currencies',
    emptyLabel: '(no currencies)',
    list: () => zb.currencies.list({ page: argv.page, per_page: argv.perPage }),
    getAll: () => zb.currencies.getAll(),
  });
}
