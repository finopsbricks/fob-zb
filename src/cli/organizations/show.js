// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatDate } from '../utils/format.js';

export async function showOrganizationHandler(argv) {
  const zb = clientFor();
  const org = await zb.organizations.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(org, null, 2));
    return;
  }

  if (!org) {
    console.error(`No organization found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 20;
  console.log(formatField('Org ID', org.organization_id, w));
  console.log(formatField('Name', org.name, w));
  console.log(formatField('Contact', org.contact_name, w));
  console.log(formatField('Currency', org.currency_code, w));
  console.log(formatField('Country', org.country, w));
  console.log(formatField('Time Zone', org.time_zone, w));
  console.log(formatField('Fiscal Year Start', org.fiscal_year_start_month, w));
  console.log(formatField('Default Org', org.is_default_org ? 'yes' : 'no', w));
  console.log(formatField('Plan', org.plan_type, w));
  console.log(formatField('Created', formatDate(org.account_created_date), w));
}
