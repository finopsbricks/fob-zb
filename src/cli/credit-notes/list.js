// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  open: 'Status.Open', closed: 'Status.Closed', void: 'Status.Void', draft: 'Status.Draft',
};

const PUBLIC_FIELDS = [
  'creditnote_id', 'creditnote_number', 'customer_name', 'status', 'date',
  'total', 'balance', 'currency_code',
];
const DEFAULT_FIELDS = ['creditnote_id', 'creditnote_number', 'customer_name', 'date', 'status', 'total', 'balance'];

const COLUMNS = {
  creditnote_id:     { header: 'ID',       align: 'left',  render: (c) => String(c.creditnote_id ?? ''), raw: (c) => c.creditnote_id },
  creditnote_number: { header: 'NUMBER',   align: 'left',  render: (c) => c.creditnote_number ?? '',      raw: (c) => c.creditnote_number },
  customer_name:     { header: 'CUSTOMER', align: 'left',  render: (c) => c.customer_name ?? '',           raw: (c) => c.customer_name },
  status:            { header: 'STATUS',   align: 'left',  render: (c) => c.status ?? '',                  raw: (c) => c.status },
  date:              { header: 'DATE',     align: 'left',  render: (c) => formatDate(c.date),              raw: (c) => c.date },
  total:             { header: 'TOTAL',    align: 'right', render: (c) => formatCurrency(c.total),         raw: (c) => c.total },
  balance:           { header: 'BALANCE',  align: 'right', render: (c) => formatCurrency(c.balance),       raw: (c) => c.balance },
  currency_code:     { header: 'CCY',      align: 'left',  render: (c) => c.currency_code ?? '',           raw: (c) => c.currency_code },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  if (argv.customer) p.customer_id = argv.customer;
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listCreditNotesHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'creditnotes',
    emptyLabel: '(no credit notes)',
    list: () => zb.creditNotes.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.creditNotes.getAll(params),
  });
}
