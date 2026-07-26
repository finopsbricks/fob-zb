// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  draft: 'Status.Draft', published: 'Status.Published',
};

const PUBLIC_FIELDS = [
  'journal_id', 'journal_date', 'entry_number', 'reference_number', 'notes', 'total', 'status',
];
const DEFAULT_FIELDS = ['journal_id', 'journal_date', 'entry_number', 'reference_number', 'total', 'status'];

const COLUMNS = {
  journal_id:      { header: 'ID',        align: 'left',  render: (j) => String(j.journal_id ?? ''),         raw: (j) => j.journal_id },
  journal_date:    { header: 'DATE',      align: 'left',  render: (j) => formatDate(j.journal_date),          raw: (j) => j.journal_date },
  entry_number:    { header: 'ENTRY',     align: 'left',  render: (j) => j.entry_number ?? '',                raw: (j) => j.entry_number },
  reference_number:{ header: 'REFERENCE', align: 'left',  render: (j) => j.reference_number ?? '',            raw: (j) => j.reference_number },
  notes:           { header: 'NOTES',     align: 'left',  render: (j) => (j.notes ?? '').slice(0, 40),        raw: (j) => j.notes },
  total:           { header: 'TOTAL',     align: 'right', render: (j) => formatCurrency(j.total),             raw: (j) => j.total },
  status:          { header: 'STATUS',    align: 'left',  render: (j) => j.status ?? '',                      raw: (j) => j.status },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  return p;
}

export async function listJournalsHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'journals',
    emptyLabel: '(no journals)',
    list: () => zb.journals.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.journals.getAll(params),
  });
}
