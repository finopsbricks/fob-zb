// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  all: 'Status.All', sent: 'Status.Sent', draft: 'Status.Draft', overdue: 'Status.OverDue',
  paid: 'Status.Paid', partially_paid: 'Status.PartiallyPaid', void: 'Status.Void',
  unpaid: 'Status.Unpaid', viewed: 'Status.Viewed',
};

const PUBLIC_FIELDS = [
  'invoice_id', 'invoice_number', 'customer_name', 'status', 'date', 'due_date',
  'total', 'balance', 'currency_code', 'reference_number',
];
const DEFAULT_FIELDS = ['invoice_id', 'invoice_number', 'customer_name', 'date', 'status', 'total', 'balance'];

const COLUMNS = {
  invoice_id:      { header: 'ID',        align: 'left',  render: (i) => String(i.invoice_id ?? ''),  raw: (i) => i.invoice_id },
  invoice_number:  { header: 'NUMBER',    align: 'left',  render: (i) => i.invoice_number ?? '',       raw: (i) => i.invoice_number },
  customer_name:   { header: 'CUSTOMER',  align: 'left',  render: (i) => i.customer_name ?? '',         raw: (i) => i.customer_name },
  status:          { header: 'STATUS',    align: 'left',  render: (i) => i.status ?? '',                raw: (i) => i.status },
  date:            { header: 'DATE',      align: 'left',  render: (i) => formatDate(i.date),            raw: (i) => i.date },
  due_date:        { header: 'DUE',       align: 'left',  render: (i) => formatDate(i.due_date),        raw: (i) => i.due_date },
  total:           { header: 'TOTAL',     align: 'right', render: (i) => formatCurrency(i.total),       raw: (i) => i.total },
  balance:         { header: 'BALANCE',   align: 'right', render: (i) => formatCurrency(i.balance),     raw: (i) => i.balance },
  currency_code:   { header: 'CCY',       align: 'left',  render: (i) => i.currency_code ?? '',         raw: (i) => i.currency_code },
  reference_number:{ header: 'REFERENCE', align: 'left',  render: (i) => i.reference_number ?? '',      raw: (i) => i.reference_number },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  if (argv.customer) p.customer_id = argv.customer;
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listInvoicesHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'invoices',
    emptyLabel: '(no invoices)',
    list: () => zb.invoices.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.invoices.getAll(params),
  });
}
