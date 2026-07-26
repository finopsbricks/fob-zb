// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = { all: 'Status.All', active: 'Status.Active', inactive: 'Status.Inactive' };

const PUBLIC_FIELDS = [
  'item_id', 'name', 'sku', 'unit', 'rate', 'purchase_rate', 'product_type',
  'item_type', 'status', 'account_name', 'purchase_account_name',
];
const DEFAULT_FIELDS = ['item_id', 'name', 'sku', 'rate', 'product_type', 'status'];

const COLUMNS = {
  item_id:              { header: 'ID',        align: 'left',  render: (i) => String(i.item_id ?? ''),        raw: (i) => i.item_id },
  name:                 { header: 'NAME',      align: 'left',  render: (i) => i.name ?? '',                    raw: (i) => i.name },
  sku:                  { header: 'SKU',       align: 'left',  render: (i) => i.sku ?? '',                     raw: (i) => i.sku },
  unit:                 { header: 'UNIT',      align: 'left',  render: (i) => i.unit ?? '',                    raw: (i) => i.unit },
  rate:                 { header: 'RATE',      align: 'right', render: (i) => formatCurrency(i.rate),          raw: (i) => i.rate },
  purchase_rate:        { header: 'PURCHASE',  align: 'right', render: (i) => formatCurrency(i.purchase_rate), raw: (i) => i.purchase_rate },
  product_type:         { header: 'PRODUCT',   align: 'left',  render: (i) => i.product_type ?? '',            raw: (i) => i.product_type },
  item_type:            { header: 'ITEM TYPE', align: 'left',  render: (i) => i.item_type ?? '',               raw: (i) => i.item_type },
  status:               { header: 'STATUS',    align: 'left',  render: (i) => i.status ?? '',                  raw: (i) => i.status },
  account_name:         { header: 'SALES ACCT',align: 'left',  render: (i) => i.account_name ?? '',            raw: (i) => i.account_name },
  purchase_account_name:{ header: 'PUR ACCT',  align: 'left',  render: (i) => i.purchase_account_name ?? '',   raw: (i) => i.purchase_account_name },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listItemsHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'items',
    emptyLabel: '(no items)',
    list: () => zb.items.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.items.getAll(params),
  });
}
