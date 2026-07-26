// @ts-check
import { clientFor } from '../_helpers.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  active: 'Status.Active', inactive: 'Status.Inactive', invited: 'Status.Invited',
};

const PUBLIC_FIELDS = [
  'user_id', 'name', 'email', 'role_name', 'status',
];
const DEFAULT_FIELDS = ['user_id', 'name', 'email', 'role_name', 'status'];

const COLUMNS = {
  user_id:   { header: 'ID',     align: 'left', render: (u) => String(u.user_id ?? ''), raw: (u) => u.user_id },
  name:      { header: 'NAME',   align: 'left', render: (u) => u.name ?? '',            raw: (u) => u.name },
  email:     { header: 'EMAIL',  align: 'left', render: (u) => u.email ?? '',           raw: (u) => u.email },
  role_name: { header: 'ROLE',   align: 'left', render: (u) => u.role_name ?? '',       raw: (u) => u.role_name },
  status:    { header: 'STATUS', align: 'left', render: (u) => u.status ?? '',          raw: (u) => u.status },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  return p;
}

export async function listUsersHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'users',
    emptyLabel: '(no users)',
    list: () => zb.users.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.users.getAll(params),
  });
}
