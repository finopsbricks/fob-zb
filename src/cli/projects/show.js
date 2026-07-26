// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency } from '../utils/format.js';

export async function showProjectHandler(argv) {
  const zb = clientFor();
  const p = await zb.projects.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(p, null, 2));
    return;
  }
  if (!p) {
    console.error(`No project found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', p.project_id, w));
  console.log(formatField('Name', p.project_name, w));
  console.log(formatField('Customer', p.customer_name, w));
  console.log(formatField('Status', p.status, w));
  console.log(formatField('Billing Type', p.billing_type, w));
  console.log(formatField('Rate', formatCurrency(p.rate), w));
  console.log(formatField('Description', p.description, w));
}
