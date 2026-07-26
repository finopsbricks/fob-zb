// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  draft: 'Status.Draft', sent: 'Status.Sent', invoiced: 'Status.Invoiced',
  accepted: 'Status.Accepted', declined: 'Status.Declined', expired: 'Status.Expired',
};

const PUBLIC_FIELDS = [
  'estimate_id', 'estimate_number', 'customer_name', 'status', 'date',
  'total', 'currency_code', 'reference_number',
];
const DEFAULT_FIELDS = ['estimate_id', 'estimate_number', 'customer_name', 'date', 'status', 'total'];

const COLUMNS = {
  estimate_id:     { header: 'ID',        align: 'left',  render: (e) => String(e.estimate_id ?? ''),  raw: (e) => e.estimate_id },
  estimate_number: { header: 'NUMBER',    align: 'left',  render: (e) => e.estimate_number ?? '',       raw: (e) => e.estimate_number },
  customer_name:   { header: 'CUSTOMER',  align: 'left',  render: (e) => e.customer_name ?? '',          raw: (e) => e.customer_name },
  status:          { header: 'STATUS',    align: 'left',  render: (e) => e.status ?? '',                 raw: (e) => e.status },
  date:            { header: 'DATE',      align: 'left',  render: (e) => formatDate(e.date),             raw: (e) => e.date },
  total:           { header: 'TOTAL',     align: 'right', render: (e) => formatCurrency(e.total),        raw: (e) => e.total },
  currency_code:   { header: 'CCY',       align: 'left',  render: (e) => e.currency_code ?? '',          raw: (e) => e.currency_code },
  reference_number:{ header: 'REFERENCE', align: 'left',  render: (e) => e.reference_number ?? '',       raw: (e) => e.reference_number },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  if (argv.customer) p.customer_id = argv.customer;
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listEstimatesHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'estimates',
    emptyLabel: '(no estimates)',
    list: () => zb.estimates.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.estimates.getAll(params),
  });
}
