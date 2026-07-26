// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const PUBLIC_FIELDS = [
  'payment_id', 'payment_number', 'date', 'customer_name', 'payment_mode',
  'amount', 'unused_amount', 'reference_number', 'invoice_numbers', 'account_name',
];
const DEFAULT_FIELDS = ['payment_id', 'payment_number', 'date', 'customer_name', 'payment_mode', 'amount', 'unused_amount'];

const COLUMNS = {
  payment_id:      { header: 'ID',        align: 'left',  render: (p) => String(p.payment_id ?? ''),      raw: (p) => p.payment_id },
  payment_number:  { header: 'NUMBER',    align: 'left',  render: (p) => p.payment_number ?? '',           raw: (p) => p.payment_number },
  date:            { header: 'DATE',      align: 'left',  render: (p) => formatDate(p.date),               raw: (p) => p.date },
  customer_name:   { header: 'CUSTOMER',  align: 'left',  render: (p) => p.customer_name ?? '',            raw: (p) => p.customer_name },
  payment_mode:    { header: 'MODE',      align: 'left',  render: (p) => p.payment_mode ?? '',             raw: (p) => p.payment_mode },
  amount:          { header: 'AMOUNT',    align: 'right', render: (p) => formatCurrency(p.amount),         raw: (p) => p.amount },
  unused_amount:   { header: 'UNUSED',    align: 'right', render: (p) => formatCurrency(p.unused_amount),  raw: (p) => p.unused_amount },
  reference_number:{ header: 'REFERENCE', align: 'left',  render: (p) => p.reference_number ?? '',         raw: (p) => p.reference_number },
  invoice_numbers: { header: 'INVOICES',  align: 'left',  render: (p) => p.invoice_numbers ?? '',          raw: (p) => p.invoice_numbers },
  account_name:    { header: 'DEPOSIT TO',align: 'left',  render: (p) => p.account_name ?? '',             raw: (p) => p.account_name },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.customer) p.customer_id = argv.customer;
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listCustomerPaymentsHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'customerpayments',
    emptyLabel: '(no customer payments)',
    list: () => zb.customerPayments.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.customerPayments.getAll(params),
  });
}
