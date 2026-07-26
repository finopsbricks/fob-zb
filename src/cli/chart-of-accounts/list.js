// @ts-check
import { clientFor } from '../_helpers.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const TYPE_FILTER = {
  all: 'AccountType.All', active: 'AccountType.Active', inactive: 'AccountType.Inactive',
  asset: 'AccountType.Asset', liability: 'AccountType.Liability', equity: 'AccountType.Equity',
  income: 'AccountType.Income', expense: 'AccountType.Expense',
};

const PUBLIC_FIELDS = [
  'account_id', 'account_name', 'account_code', 'account_type', 'is_active',
  'parent_account_name', 'description',
];
const DEFAULT_FIELDS = ['account_id', 'account_name', 'account_code', 'account_type', 'is_active'];

const COLUMNS = {
  account_id:          { header: 'ID',          align: 'left', render: (a) => String(a.account_id ?? ''),      raw: (a) => a.account_id },
  account_name:        { header: 'NAME',        align: 'left', render: (a) => a.account_name ?? '',            raw: (a) => a.account_name },
  account_code:        { header: 'CODE',        align: 'left', render: (a) => a.account_code ?? '',            raw: (a) => a.account_code },
  account_type:        { header: 'TYPE',        align: 'left', render: (a) => a.account_type ?? '',            raw: (a) => a.account_type },
  is_active:           { header: 'ACTIVE',      align: 'left', render: (a) => (a.is_active ? 'yes' : 'no'),    raw: (a) => a.is_active },
  parent_account_name: { header: 'PARENT',      align: 'left', render: (a) => a.parent_account_name ?? '',     raw: (a) => a.parent_account_name },
  description:         { header: 'DESCRIPTION', align: 'left', render: (a) => (a.description ?? '').slice(0, 40), raw: (a) => a.description },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.type && TYPE_FILTER[argv.type]) p.filter_by = TYPE_FILTER[argv.type];
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listChartOfAccountsHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'chartofaccounts',
    emptyLabel: '(no accounts)',
    list: () => zb.chartOfAccounts.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.chartOfAccounts.getAll(params),
  });
}
