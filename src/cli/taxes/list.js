// @ts-check
import { clientFor } from '../_helpers.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const PUBLIC_FIELDS = [
  'tax_id', 'tax_name', 'tax_percentage', 'tax_type',
];
const DEFAULT_FIELDS = ['tax_id', 'tax_name', 'tax_percentage', 'tax_type'];

const COLUMNS = {
  tax_id:         { header: 'ID',      align: 'left',  render: (t) => String(t.tax_id ?? ''),         raw: (t) => t.tax_id },
  tax_name:       { header: 'NAME',    align: 'left',  render: (t) => t.tax_name ?? '',               raw: (t) => t.tax_name },
  tax_percentage: { header: 'PERCENT', align: 'right', render: (t) => String(t.tax_percentage ?? ''), raw: (t) => t.tax_percentage },
  tax_type:       { header: 'TYPE',    align: 'left',  render: (t) => t.tax_type ?? '',               raw: (t) => t.tax_type },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

export async function listTaxesHandler(argv) {
  const zb = clientFor();
  await runList({
    argv,
    selector,
    jsonKey: 'taxes',
    emptyLabel: '(no taxes)',
    list: () => zb.taxes.list({ page: argv.page, per_page: argv.perPage }),
    getAll: () => zb.taxes.getAll(),
  });
}
