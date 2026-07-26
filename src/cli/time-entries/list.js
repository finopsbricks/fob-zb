// @ts-check
import { clientFor } from '../_helpers.js';
import { formatDate } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const PUBLIC_FIELDS = [
  'time_entry_id', 'project_name', 'task_name', 'user_name', 'log_date', 'log_time', 'is_billable',
];
const DEFAULT_FIELDS = ['time_entry_id', 'project_name', 'task_name', 'user_name', 'log_date', 'log_time'];

const COLUMNS = {
  time_entry_id: { header: 'ID',       align: 'left', render: (t) => String(t.time_entry_id ?? ''), raw: (t) => t.time_entry_id },
  project_name:  { header: 'PROJECT',  align: 'left', render: (t) => t.project_name ?? '',           raw: (t) => t.project_name },
  task_name:     { header: 'TASK',     align: 'left', render: (t) => t.task_name ?? '',              raw: (t) => t.task_name },
  user_name:     { header: 'USER',     align: 'left', render: (t) => t.user_name ?? '',              raw: (t) => t.user_name },
  log_date:      { header: 'DATE',     align: 'left', render: (t) => formatDate(t.log_date),         raw: (t) => t.log_date },
  log_time:      { header: 'HOURS',    align: 'left', render: (t) => t.log_time ?? '',               raw: (t) => t.log_time },
  is_billable:   { header: 'BILLABLE', align: 'left', render: (t) => (t.is_billable ? 'yes' : ''),   raw: (t) => t.is_billable },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.project) p.project_id = argv.project;
  if (argv.user) p.user_id = argv.user;
  return p;
}

export async function listTimeEntriesHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'time_entries',
    emptyLabel: '(no time entries)',
    list: () => zb.timeEntries.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.timeEntries.getAll(params),
  });
}
