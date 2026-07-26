// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  open: 'Status.Open', closed: 'Status.Closed', void: 'Status.Void', draft: 'Status.Draft',
};

const PUBLIC_FIELDS = [
  'vendor_credit_id', 'vendor_credit_number', 'vendor_name', 'status', 'date',
  'total', 'balance', 'currency_code',
];
const DEFAULT_FIELDS = ['vendor_credit_id', 'vendor_credit_number', 'vendor_name', 'date', 'status', 'total', 'balance'];

const COLUMNS = {
  vendor_credit_id:     { header: 'ID',      align: 'left',  render: (v) => String(v.vendor_credit_id ?? ''),  raw: (v) => v.vendor_credit_id },
  vendor_credit_number: { header: 'NUMBER',  align: 'left',  render: (v) => v.vendor_credit_number ?? '',       raw: (v) => v.vendor_credit_number },
  vendor_name:          { header: 'VENDOR',  align: 'left',  render: (v) => v.vendor_name ?? '',                raw: (v) => v.vendor_name },
  status:               { header: 'STATUS',  align: 'left',  render: (v) => v.status ?? '',                     raw: (v) => v.status },
  date:                 { header: 'DATE',    align: 'left',  render: (v) => formatDate(v.date),                 raw: (v) => v.date },
  total:                { header: 'TOTAL',   align: 'right', render: (v) => formatCurrency(v.total),            raw: (v) => v.total },
  balance:              { header: 'BALANCE', align: 'right', render: (v) => formatCurrency(v.balance),          raw: (v) => v.balance },
  currency_code:        { header: 'CCY',     align: 'left',  render: (v) => v.currency_code ?? '',              raw: (v) => v.currency_code },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  if (argv.vendor) p.vendor_id = argv.vendor;
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listVendorCreditsHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'vendor_credits',
    emptyLabel: '(no vendor credits)',
    list: () => zb.vendorCredits.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.vendorCredits.getAll(params),
  });
}
