// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';
import { runList } from '../utils/list-runner.js';

const PUBLIC_FIELDS = [
  'contact_id', 'contact_name', 'company_name', 'contact_type', 'status',
  'email', 'phone', 'currency_code', 'outstanding_receivable_amount',
  'outstanding_payable_amount', 'payment_terms_label',
];

const DEFAULT_FIELDS = ['contact_id', 'contact_name', 'company_name', 'contact_type', 'email', 'status'];

const COLUMNS = {
  contact_id:                   { header: 'ID',            align: 'left',  render: (c) => String(c.contact_id ?? ''),                       raw: (c) => c.contact_id },
  contact_name:                 { header: 'NAME',          align: 'left',  render: (c) => c.contact_name ?? '',                              raw: (c) => c.contact_name },
  company_name:                 { header: 'COMPANY',       align: 'left',  render: (c) => c.company_name ?? '',                              raw: (c) => c.company_name },
  contact_type:                 { header: 'TYPE',          align: 'left',  render: (c) => c.contact_type ?? '',                              raw: (c) => c.contact_type },
  status:                       { header: 'STATUS',        align: 'left',  render: (c) => c.status ?? '',                                    raw: (c) => c.status },
  email:                        { header: 'EMAIL',         align: 'left',  render: (c) => c.email ?? '',                                     raw: (c) => c.email },
  phone:                        { header: 'PHONE',         align: 'left',  render: (c) => c.phone ?? '',                                     raw: (c) => c.phone },
  currency_code:                { header: 'CCY',           align: 'left',  render: (c) => c.currency_code ?? '',                             raw: (c) => c.currency_code },
  outstanding_receivable_amount:{ header: 'RECEIVABLE',    align: 'right', render: (c) => formatCurrency(c.outstanding_receivable_amount),   raw: (c) => c.outstanding_receivable_amount },
  outstanding_payable_amount:   { header: 'PAYABLE',       align: 'right', render: (c) => formatCurrency(c.outstanding_payable_amount),      raw: (c) => c.outstanding_payable_amount },
  payment_terms_label:          { header: 'TERMS',         align: 'left',  render: (c) => c.payment_terms_label ?? '',                       raw: (c) => c.payment_terms_label },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

// Zoho contacts filter on a single `filter_by` dimension: type (Status.Customers/
// Status.Vendors) OR status (Status.Active/Status.Inactive), not both. Passing
// both silently ignores one, so reject that combination outright.
function searchParams(argv) {
  const hasStatus = argv.status && argv.status !== 'all';
  if (argv.type && hasStatus) {
    throw new Error(
      'Filter by --type or --status, not both — Zoho contacts allow a single filter dimension.',
    );
  }
  const p = {};
  if (argv.type) {
    p.filter_by = argv.type === 'customer' ? 'Status.Customers' : 'Status.Vendors';
  } else if (hasStatus) {
    p.filter_by = `Status.${argv.status.charAt(0).toUpperCase()}${argv.status.slice(1)}`;
  }
  if (argv.search) p.search_text = argv.search;
  return p;
}

export async function listContactsHandler(argv) {
  const zb = clientFor();
  const params = searchParams(argv);
  await runList({
    argv,
    selector,
    jsonKey: 'contacts',
    emptyLabel: '(no contacts)',
    list: () => zb.contacts.list({ page: argv.page, per_page: argv.perPage, ...params }),
    getAll: () => zb.contacts.getAll(params),
  });
}
