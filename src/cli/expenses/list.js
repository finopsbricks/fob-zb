// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  all: 'Status.All', billable: 'Status.Billable', nonbillable: 'Status.Nonbillable',
  reimbursed: 'Status.Reimbursed', invoiced: 'Status.Invoiced', unbilled: 'Status.Unbilled',
};

const PUBLIC_FIELDS = [
  'expense_id', 'date', 'account_name', 'paid_through_account_name', 'vendor_name',
  'customer_name', 'total', 'status', 'is_billable', 'currency_code', 'reference_number',
];
const DEFAULT_FIELDS = ['expense_id', 'date', 'account_name', 'vendor_name', 'total', 'status'];

const COLUMNS = {
  expense_id:               { header: 'ID',          align: 'left',  render: (e) => String(e.expense_id ?? ''),          raw: (e) => e.expense_id },
  date:                     { header: 'DATE',        align: 'left',  render: (e) => formatDate(e.date),                  raw: (e) => e.date },
  account_name:             { header: 'ACCOUNT',     align: 'left',  render: (e) => e.account_name ?? '',                raw: (e) => e.account_name },
  paid_through_account_name:{ header: 'PAID THROUGH',align: 'left',  render: (e) => e.paid_through_account_name ?? '',   raw: (e) => e.paid_through_account_name },
  vendor_name:              { header: 'VENDOR',      align: 'left',  render: (e) => e.vendor_name ?? '',                 raw: (e) => e.vendor_name },
  customer_name:            { header: 'CUSTOMER',    align: 'left',  render: (e) => e.customer_name ?? '',               raw: (e) => e.customer_name },
  total:                    { header: 'TOTAL',       align: 'right', render: (e) => formatCurrency(e.total),             raw: (e) => e.total },
  status:                   { header: 'STATUS',      align: 'left',  render: (e) => e.status ?? '',                      raw: (e) => e.status },
  is_billable:              { header: 'BILLABLE',    align: 'left',  render: (e) => (e.is_billable ? 'yes' : ''),        raw: (e) => e.is_billable },
  currency_code:            { header: 'CCY',         align: 'left',  render: (e) => e.currency_code ?? '',               raw: (e) => e.currency_code },
  reference_number:         { header: 'REFERENCE',   align: 'left',  render: (e) => e.reference_number ?? '',            raw: (e) => e.reference_number },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listExpensesHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'expenses',
    emptyLabel: '(no expenses)',
    list: () => zb.expenses.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.expenses.getAll(params),
  });
}
