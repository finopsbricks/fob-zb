// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  active: 'Status.Active', stopped: 'Status.Stopped', expired: 'Status.Expired',
};

const PUBLIC_FIELDS = [
  'recurring_expense_id', 'recurrence_name', 'account_name', 'status',
  'recurrence_frequency', 'total',
];
const DEFAULT_FIELDS = ['recurring_expense_id', 'recurrence_name', 'account_name', 'status', 'recurrence_frequency', 'total'];

const COLUMNS = {
  recurring_expense_id:  { header: 'ID',      align: 'left',  render: (r) => String(r.recurring_expense_id ?? ''), raw: (r) => r.recurring_expense_id },
  recurrence_name:       { header: 'NAME',    align: 'left',  render: (r) => r.recurrence_name ?? '',              raw: (r) => r.recurrence_name },
  account_name:          { header: 'ACCOUNT', align: 'left',  render: (r) => r.account_name ?? '',                 raw: (r) => r.account_name },
  status:                { header: 'STATUS',  align: 'left',  render: (r) => r.status ?? '',                       raw: (r) => r.status },
  recurrence_frequency:  { header: 'FREQ',    align: 'left',  render: (r) => r.recurrence_frequency ?? '',         raw: (r) => r.recurrence_frequency },
  total:                 { header: 'TOTAL',   align: 'right', render: (r) => formatCurrency(r.total),              raw: (r) => r.total },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listRecurringExpensesHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'recurring_expenses',
    emptyLabel: '(no recurring expenses)',
    list: () => zb.recurringExpenses.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.recurringExpenses.getAll(params),
  });
}
