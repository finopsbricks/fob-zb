// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  all: 'Status.All', draft: 'Status.Draft', open: 'Status.Open', overdue: 'Status.Overdue',
  paid: 'Status.Paid', partially_paid: 'Status.PartiallyPaid', void: 'Status.Void',
};

const PUBLIC_FIELDS = [
  'bill_id', 'bill_number', 'vendor_name', 'status', 'date', 'due_date',
  'total', 'balance', 'currency_code', 'reference_number',
];
const DEFAULT_FIELDS = ['bill_id', 'bill_number', 'vendor_name', 'date', 'status', 'total', 'balance'];

const COLUMNS = {
  bill_id:         { header: 'ID',        align: 'left',  render: (b) => String(b.bill_id ?? ''),   raw: (b) => b.bill_id },
  bill_number:     { header: 'NUMBER',    align: 'left',  render: (b) => b.bill_number ?? '',        raw: (b) => b.bill_number },
  vendor_name:     { header: 'VENDOR',    align: 'left',  render: (b) => b.vendor_name ?? '',        raw: (b) => b.vendor_name },
  status:          { header: 'STATUS',    align: 'left',  render: (b) => b.status ?? '',             raw: (b) => b.status },
  date:            { header: 'DATE',      align: 'left',  render: (b) => formatDate(b.date),         raw: (b) => b.date },
  due_date:        { header: 'DUE',       align: 'left',  render: (b) => formatDate(b.due_date),     raw: (b) => b.due_date },
  total:           { header: 'TOTAL',     align: 'right', render: (b) => formatCurrency(b.total),    raw: (b) => b.total },
  balance:         { header: 'BALANCE',   align: 'right', render: (b) => formatCurrency(b.balance),  raw: (b) => b.balance },
  currency_code:   { header: 'CCY',       align: 'left',  render: (b) => b.currency_code ?? '',      raw: (b) => b.currency_code },
  reference_number:{ header: 'REFERENCE', align: 'left',  render: (b) => b.reference_number ?? '',   raw: (b) => b.reference_number },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  if (argv.vendor) p.vendor_id = argv.vendor;
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listBillsHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'bills',
    emptyLabel: '(no bills)',
    list: () => zb.bills.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.bills.getAll(params),
  });
}
