// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const PUBLIC_FIELDS = [
  'payment_id', 'date', 'vendor_name', 'payment_mode', 'amount', 'unused_amount',
  'reference_number', 'paid_through_account_name',
];
const DEFAULT_FIELDS = ['payment_id', 'date', 'vendor_name', 'payment_mode', 'amount', 'reference_number'];

const COLUMNS = {
  payment_id:               { header: 'ID',           align: 'left',  render: (p) => String(p.payment_id ?? ''),        raw: (p) => p.payment_id },
  date:                     { header: 'DATE',         align: 'left',  render: (p) => formatDate(p.date),                 raw: (p) => p.date },
  vendor_name:              { header: 'VENDOR',       align: 'left',  render: (p) => p.vendor_name ?? '',                raw: (p) => p.vendor_name },
  payment_mode:             { header: 'MODE',         align: 'left',  render: (p) => p.payment_mode ?? '',               raw: (p) => p.payment_mode },
  amount:                   { header: 'AMOUNT',       align: 'right', render: (p) => formatCurrency(p.amount),           raw: (p) => p.amount },
  unused_amount:            { header: 'UNUSED',       align: 'right', render: (p) => formatCurrency(p.unused_amount),    raw: (p) => p.unused_amount },
  reference_number:         { header: 'REFERENCE',    align: 'left',  render: (p) => p.reference_number ?? '',           raw: (p) => p.reference_number },
  paid_through_account_name:{ header: 'PAID THROUGH', align: 'left',  render: (p) => p.paid_through_account_name ?? '',   raw: (p) => p.paid_through_account_name },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.vendor) p.vendor_id = argv.vendor;
  return p;
}

export async function listVendorPaymentsHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'vendorpayments',
    emptyLabel: '(no vendor payments)',
    list: () => zb.vendorPayments.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.vendorPayments.getAll(params),
  });
}
