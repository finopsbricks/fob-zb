// @ts-check
import { clientFor } from '../_helpers.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const PUBLIC_FIELDS = [
  'contact_person_id', 'first_name', 'last_name', 'email', 'phone', 'is_primary_contact', 'contact_id',
];
const DEFAULT_FIELDS = ['contact_person_id', 'first_name', 'last_name', 'email', 'phone', 'is_primary_contact'];

const COLUMNS = {
  contact_person_id:  { header: 'ID',      align: 'left', render: (c) => String(c.contact_person_id ?? ''),   raw: (c) => c.contact_person_id },
  first_name:         { header: 'FIRST',   align: 'left', render: (c) => c.first_name ?? '',                  raw: (c) => c.first_name },
  last_name:          { header: 'LAST',    align: 'left', render: (c) => c.last_name ?? '',                   raw: (c) => c.last_name },
  email:              { header: 'EMAIL',   align: 'left', render: (c) => c.email ?? '',                       raw: (c) => c.email },
  phone:              { header: 'PHONE',   align: 'left', render: (c) => c.phone ?? '',                       raw: (c) => c.phone },
  is_primary_contact: { header: 'PRIMARY', align: 'left', render: (c) => (c.is_primary_contact ? 'yes' : ''), raw: (c) => c.is_primary_contact },
  contact_id:         { header: 'CONTACT', align: 'left', render: (c) => String(c.contact_id ?? ''),          raw: (c) => c.contact_id },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.contact) p.contact_id = argv.contact;
  return p;
}

export async function listContactPersonsHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'contact_persons',
    emptyLabel: '(no contact persons)',
    list: () => zb.contactPersons.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.contactPersons.getAll(params),
  });
}
