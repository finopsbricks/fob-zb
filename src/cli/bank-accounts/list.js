// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = { all: 'Status.All', active: 'Status.Active', inactive: 'Status.Inactive' };

const PUBLIC_FIELDS = [
  'account_id', 'account_name', 'account_type', 'account_sub_type', 'bank_name',
  'currency_code', 'balance', 'is_active', 'uncategorized_transactions',
];
const DEFAULT_FIELDS = ['account_id', 'account_name', 'account_type', 'bank_name', 'currency_code', 'balance'];

const COLUMNS = {
  account_id:                { header: 'ID',          align: 'left',  render: (a) => String(a.account_id ?? ''),               raw: (a) => a.account_id },
  account_name:              { header: 'NAME',        align: 'left',  render: (a) => a.account_name ?? '',                     raw: (a) => a.account_name },
  account_type:              { header: 'TYPE',        align: 'left',  render: (a) => a.account_type ?? '',                     raw: (a) => a.account_type },
  account_sub_type:          { header: 'SUBTYPE',     align: 'left',  render: (a) => a.account_sub_type ?? '',                 raw: (a) => a.account_sub_type },
  bank_name:                 { header: 'BANK',        align: 'left',  render: (a) => a.bank_name ?? '',                        raw: (a) => a.bank_name },
  currency_code:             { header: 'CCY',         align: 'left',  render: (a) => a.currency_code ?? '',                    raw: (a) => a.currency_code },
  balance:                   { header: 'BALANCE',     align: 'right', render: (a) => formatCurrency(a.balance),               raw: (a) => a.balance },
  is_active:                 { header: 'ACTIVE',      align: 'left',  render: (a) => (a.is_active ? 'yes' : 'no'),             raw: (a) => a.is_active },
  uncategorized_transactions:{ header: 'UNCATEGORIZED',align: 'right', render: (a) => String(a.uncategorized_transactions ?? ''), raw: (a) => a.uncategorized_transactions },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  return p;
}

export async function listBankAccountsHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'bankaccounts',
    emptyLabel: '(no bank accounts)',
    list: () => zb.bankAccounts.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.bankAccounts.getAll(params),
  });
}
