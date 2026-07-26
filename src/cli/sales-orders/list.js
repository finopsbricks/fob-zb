// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  draft: 'Status.Draft', open: 'Status.Open', invoiced: 'Status.Invoiced',
  partially_invoiced: 'Status.PartiallyInvoiced', closed: 'Status.Closed', void: 'Status.Void',
};

const PUBLIC_FIELDS = [
  'salesorder_id', 'salesorder_number', 'customer_name', 'status', 'date',
  'total', 'currency_code', 'reference_number',
];
const DEFAULT_FIELDS = ['salesorder_id', 'salesorder_number', 'customer_name', 'date', 'status', 'total'];

const COLUMNS = {
  salesorder_id:     { header: 'ID',        align: 'left',  render: (s) => String(s.salesorder_id ?? ''), raw: (s) => s.salesorder_id },
  salesorder_number: { header: 'NUMBER',    align: 'left',  render: (s) => s.salesorder_number ?? '',      raw: (s) => s.salesorder_number },
  customer_name:     { header: 'CUSTOMER',  align: 'left',  render: (s) => s.customer_name ?? '',           raw: (s) => s.customer_name },
  status:            { header: 'STATUS',    align: 'left',  render: (s) => s.status ?? '',                  raw: (s) => s.status },
  date:              { header: 'DATE',      align: 'left',  render: (s) => formatDate(s.date),              raw: (s) => s.date },
  total:             { header: 'TOTAL',     align: 'right', render: (s) => formatCurrency(s.total),         raw: (s) => s.total },
  currency_code:     { header: 'CCY',       align: 'left',  render: (s) => s.currency_code ?? '',           raw: (s) => s.currency_code },
  reference_number:  { header: 'REFERENCE', align: 'left',  render: (s) => s.reference_number ?? '',        raw: (s) => s.reference_number },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  if (argv.customer) p.customer_id = argv.customer;
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listSalesOrdersHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'salesorders',
    emptyLabel: '(no sales orders)',
    list: () => zb.salesOrders.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.salesOrders.getAll(params),
  });
}
