// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  draft: 'Status.Draft', open: 'Status.Open', billed: 'Status.Billed',
  cancelled: 'Status.Cancelled', pending_approval: 'Status.PendingApproval',
};

const PUBLIC_FIELDS = [
  'purchaseorder_id', 'purchaseorder_number', 'vendor_name', 'status', 'date',
  'total', 'currency_code', 'reference_number',
];
const DEFAULT_FIELDS = ['purchaseorder_id', 'purchaseorder_number', 'vendor_name', 'date', 'status', 'total'];

const COLUMNS = {
  purchaseorder_id:     { header: 'ID',        align: 'left',  render: (p) => String(p.purchaseorder_id ?? ''),  raw: (p) => p.purchaseorder_id },
  purchaseorder_number: { header: 'NUMBER',    align: 'left',  render: (p) => p.purchaseorder_number ?? '',       raw: (p) => p.purchaseorder_number },
  vendor_name:          { header: 'VENDOR',    align: 'left',  render: (p) => p.vendor_name ?? '',                raw: (p) => p.vendor_name },
  status:               { header: 'STATUS',    align: 'left',  render: (p) => p.status ?? '',                     raw: (p) => p.status },
  date:                 { header: 'DATE',      align: 'left',  render: (p) => formatDate(p.date),                 raw: (p) => p.date },
  total:                { header: 'TOTAL',     align: 'right', render: (p) => formatCurrency(p.total),            raw: (p) => p.total },
  currency_code:        { header: 'CCY',       align: 'left',  render: (p) => p.currency_code ?? '',              raw: (p) => p.currency_code },
  reference_number:     { header: 'REFERENCE', align: 'left',  render: (p) => p.reference_number ?? '',           raw: (p) => p.reference_number },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  if (argv.vendor) p.vendor_id = argv.vendor;
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listPurchaseOrdersHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'purchaseorders',
    emptyLabel: '(no purchase orders)',
    list: () => zb.purchaseOrders.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.purchaseOrders.getAll(params),
  });
}
