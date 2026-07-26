// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  draft: 'Status.Draft', sent: 'Status.Sent', paid: 'Status.Paid',
  partially_paid: 'Status.PartiallyPaid', void: 'Status.Void',
  unpaid: 'Status.Unpaid', overdue: 'Status.Overdue',
};

const PUBLIC_FIELDS = [
  'retainerinvoice_id', 'retainerinvoice_number', 'customer_name', 'status', 'date',
  'total', 'balance', 'currency_code',
];
const DEFAULT_FIELDS = ['retainerinvoice_id', 'retainerinvoice_number', 'customer_name', 'date', 'status', 'total', 'balance'];

const COLUMNS = {
  retainerinvoice_id:     { header: 'ID',       align: 'left',  render: (r) => String(r.retainerinvoice_id ?? ''),  raw: (r) => r.retainerinvoice_id },
  retainerinvoice_number: { header: 'NUMBER',   align: 'left',  render: (r) => r.retainerinvoice_number ?? '',       raw: (r) => r.retainerinvoice_number },
  customer_name:          { header: 'CUSTOMER', align: 'left',  render: (r) => r.customer_name ?? '',                raw: (r) => r.customer_name },
  status:                 { header: 'STATUS',   align: 'left',  render: (r) => r.status ?? '',                       raw: (r) => r.status },
  date:                   { header: 'DATE',     align: 'left',  render: (r) => formatDate(r.date),                   raw: (r) => r.date },
  total:                  { header: 'TOTAL',    align: 'right', render: (r) => formatCurrency(r.total),              raw: (r) => r.total },
  balance:                { header: 'BALANCE',  align: 'right', render: (r) => formatCurrency(r.balance),            raw: (r) => r.balance },
  currency_code:          { header: 'CCY',      align: 'left',  render: (r) => r.currency_code ?? '',                raw: (r) => r.currency_code },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  if (argv.customer) p.customer_id = argv.customer;
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listRetainerInvoicesHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'retainerinvoices',
    emptyLabel: '(no retainer invoices)',
    list: () => zb.retainerInvoices.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.retainerInvoices.getAll(params),
  });
}
