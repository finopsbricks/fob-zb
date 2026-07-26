// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  all: 'Status.All', uncategorized: 'Status.Uncategorized', categorized: 'Status.Categorized',
  matched: 'Status.Matched', excluded: 'Status.Excluded',
};

const PUBLIC_FIELDS = [
  'transaction_id', 'date', 'transaction_type', 'amount', 'debit_or_credit', 'status',
  'account_name', 'payee', 'reference_number', 'offset_account_name', 'currency_code',
];
const DEFAULT_FIELDS = ['transaction_id', 'date', 'transaction_type', 'amount', 'status', 'account_name', 'payee'];

const COLUMNS = {
  transaction_id:    { header: 'ID',        align: 'left',  render: (t) => String(t.transaction_id ?? ''),  raw: (t) => t.transaction_id },
  date:              { header: 'DATE',      align: 'left',  render: (t) => formatDate(t.date),               raw: (t) => t.date },
  transaction_type:  { header: 'TYPE',      align: 'left',  render: (t) => t.transaction_type ?? '',         raw: (t) => t.transaction_type },
  amount:            { header: 'AMOUNT',    align: 'right', render: (t) => formatCurrency(t.amount),         raw: (t) => t.amount },
  debit_or_credit:   { header: 'DR/CR',     align: 'left',  render: (t) => t.debit_or_credit ?? '',          raw: (t) => t.debit_or_credit },
  status:            { header: 'STATUS',    align: 'left',  render: (t) => t.status ?? '',                   raw: (t) => t.status },
  account_name:      { header: 'ACCOUNT',   align: 'left',  render: (t) => t.account_name ?? '',             raw: (t) => t.account_name },
  payee:             { header: 'PAYEE',     align: 'left',  render: (t) => t.payee ?? '',                    raw: (t) => t.payee },
  reference_number:  { header: 'REFERENCE', align: 'left',  render: (t) => t.reference_number ?? '',         raw: (t) => t.reference_number },
  offset_account_name:{ header: 'OFFSET',   align: 'left',  render: (t) => t.offset_account_name ?? '',       raw: (t) => t.offset_account_name },
  currency_code:     { header: 'CCY',       align: 'left',  render: (t) => t.currency_code ?? '',            raw: (t) => t.currency_code },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.accountId) p.account_id = argv.accountId;
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  return p;
}

export async function listBankTransactionsHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'banktransactions',
    emptyLabel: '(no bank transactions)',
    list: () => zb.bankTransactions.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.bankTransactions.getAll(params),
  });
}
