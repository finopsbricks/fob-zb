// @ts-check
import { clientFor } from '../_helpers.js';
import { formatTable } from '../utils/format.js';
import { buildColumnSelector } from '../utils/list.js';

const PUBLIC_FIELDS = [
  'organization_id', 'name', 'contact_name', 'currency_code', 'country',
  'time_zone', 'is_default_org', 'plan_type', 'account_created_date',
];

const DEFAULT_FIELDS = ['organization_id', 'name', 'currency_code', 'country', 'is_default_org'];

const COLUMNS = {
  organization_id:     { header: 'ORG ID',    align: 'left', render: (o) => String(o.organization_id ?? ''), raw: (o) => o.organization_id },
  name:                { header: 'NAME',       align: 'left', render: (o) => o.name ?? '',                    raw: (o) => o.name },
  contact_name:        { header: 'CONTACT',    align: 'left', render: (o) => o.contact_name ?? '',            raw: (o) => o.contact_name },
  currency_code:       { header: 'CCY',        align: 'left', render: (o) => o.currency_code ?? '',           raw: (o) => o.currency_code },
  country:             { header: 'COUNTRY',    align: 'left', render: (o) => o.country ?? '',                 raw: (o) => o.country },
  time_zone:           { header: 'TIMEZONE',   align: 'left', render: (o) => o.time_zone ?? '',               raw: (o) => o.time_zone },
  is_default_org:      { header: 'DEFAULT',    align: 'left', render: (o) => (o.is_default_org ? 'yes' : ''),  raw: (o) => o.is_default_org },
  plan_type:           { header: 'PLAN',       align: 'left', render: (o) => String(o.plan_type ?? ''),       raw: (o) => o.plan_type },
  account_created_date:{ header: 'CREATED',    align: 'left', render: (o) => o.account_created_date ?? '',     raw: (o) => o.account_created_date },
};

const selector = buildColumnSelector({ columns: COLUMNS, defaultFields: DEFAULT_FIELDS, publicFields: PUBLIC_FIELDS });

export async function listOrganizationsHandler(argv) {
  const zb = clientFor();
  const { data } = await zb.organizations.list();

  if (argv.json) {
    console.log(JSON.stringify({ organizations: data }, null, 2));
    return;
  }

  if (data.length === 0) {
    console.log('(no organizations)');
    return;
  }

  const fields = selector.parseFields(argv.fields);
  console.log(
    formatTable(selector.headersFor(fields), selector.renderRows(data, fields), {
      align: selector.alignFor(fields),
    }),
  );
}
