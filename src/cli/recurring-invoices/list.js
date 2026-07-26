// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  active: 'Status.Active', stopped: 'Status.Stopped', expired: 'Status.Expired',
};

const PUBLIC_FIELDS = [
  'recurring_invoice_id', 'recurrence_name', 'customer_name', 'status',
  'recurrence_frequency', 'total', 'currency_code',
];
const DEFAULT_FIELDS = ['recurring_invoice_id', 'recurrence_name', 'customer_name', 'status', 'recurrence_frequency', 'total'];

const COLUMNS = {
  recurring_invoice_id:  { header: 'ID',       align: 'left',  render: (r) => String(r.recurring_invoice_id ?? ''), raw: (r) => r.recurring_invoice_id },
  recurrence_name:       { header: 'NAME',     align: 'left',  render: (r) => r.recurrence_name ?? '',              raw: (r) => r.recurrence_name },
  customer_name:         { header: 'CUSTOMER', align: 'left',  render: (r) => r.customer_name ?? '',                raw: (r) => r.customer_name },
  status:                { header: 'STATUS',   align: 'left',  render: (r) => r.status ?? '',                       raw: (r) => r.status },
  recurrence_frequency:  { header: 'FREQ',     align: 'left',  render: (r) => r.recurrence_frequency ?? '',         raw: (r) => r.recurrence_frequency },
  total:                 { header: 'TOTAL',    align: 'right', render: (r) => formatCurrency(r.total),              raw: (r) => r.total },
  currency_code:         { header: 'CCY',      align: 'left',  render: (r) => r.currency_code ?? '',                raw: (r) => r.currency_code },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  if (argv.customer) p.customer_id = argv.customer;
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listRecurringInvoicesHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'recurring_invoices',
    emptyLabel: '(no recurring invoices)',
    list: () => zb.recurringInvoices.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.recurringInvoices.getAll(params),
  });
}
