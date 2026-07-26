// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  active: 'Status.Active', stopped: 'Status.Stopped', expired: 'Status.Expired',
};

const PUBLIC_FIELDS = [
  'recurring_bill_id', 'recurrence_name', 'vendor_name', 'status',
  'recurrence_frequency', 'total',
];
const DEFAULT_FIELDS = ['recurring_bill_id', 'recurrence_name', 'vendor_name', 'status', 'recurrence_frequency', 'total'];

const COLUMNS = {
  recurring_bill_id:     { header: 'ID',     align: 'left',  render: (r) => String(r.recurring_bill_id ?? ''), raw: (r) => r.recurring_bill_id },
  recurrence_name:       { header: 'NAME',   align: 'left',  render: (r) => r.recurrence_name ?? '',            raw: (r) => r.recurrence_name },
  vendor_name:           { header: 'VENDOR', align: 'left',  render: (r) => r.vendor_name ?? '',                raw: (r) => r.vendor_name },
  status:                { header: 'STATUS', align: 'left',  render: (r) => r.status ?? '',                     raw: (r) => r.status },
  recurrence_frequency:  { header: 'FREQ',   align: 'left',  render: (r) => r.recurrence_frequency ?? '',       raw: (r) => r.recurrence_frequency },
  total:                 { header: 'TOTAL',  align: 'right', render: (r) => formatCurrency(r.total),            raw: (r) => r.total },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  if (argv.vendor) p.vendor_id = argv.vendor;
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listRecurringBillsHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'recurring_bills',
    emptyLabel: '(no recurring bills)',
    list: () => zb.recurringBills.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.recurringBills.getAll(params),
  });
}
