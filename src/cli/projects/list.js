// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const STATUS_FILTER = {
  active: 'Status.Active', inactive: 'Status.Inactive',
};

const PUBLIC_FIELDS = [
  'project_id', 'project_name', 'customer_name', 'status', 'billing_type', 'rate',
];
const DEFAULT_FIELDS = ['project_id', 'project_name', 'customer_name', 'status', 'billing_type'];

const COLUMNS = {
  project_id:    { header: 'ID',       align: 'left',  render: (p) => String(p.project_id ?? ''), raw: (p) => p.project_id },
  project_name:  { header: 'NAME',     align: 'left',  render: (p) => p.project_name ?? '',        raw: (p) => p.project_name },
  customer_name: { header: 'CUSTOMER', align: 'left',  render: (p) => p.customer_name ?? '',       raw: (p) => p.customer_name },
  status:        { header: 'STATUS',   align: 'left',  render: (p) => p.status ?? '',              raw: (p) => p.status },
  billing_type:  { header: 'BILLING',  align: 'left',  render: (p) => p.billing_type ?? '',        raw: (p) => p.billing_type },
  rate:          { header: 'RATE',     align: 'right', render: (p) => formatCurrency(p.rate),      raw: (p) => p.rate },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

function searchParams(argv) {
  const p = {};
  if (argv.status && STATUS_FILTER[argv.status]) p.filter_by = STATUS_FILTER[argv.status];
  if (argv.customer) p.customer_id = argv.customer;
  return p;
}

export async function listProjectsHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'projects',
    emptyLabel: '(no projects)',
    list: () => zb.projects.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.projects.getAll(params),
  });
}
