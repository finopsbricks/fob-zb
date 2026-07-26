// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField } from '../utils/format.js';

export async function showChartOfAccountHandler(argv) {
  const zb = clientFor();
  const a = await zb.chartOfAccounts.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(a, null, 2));
    return;
  }
  if (!a) {
    console.error(`No account found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 20;
  console.log(formatField('ID', a.account_id, w));
  console.log(formatField('Name', a.account_name, w));
  console.log(formatField('Code', a.account_code, w));
  console.log(formatField('Type', a.account_type, w));
  console.log(formatField('Active', a.is_active ? 'yes' : 'no', w));
  console.log(formatField('Parent', a.parent_account_name, w));
  console.log(formatField('Description', a.description, w));
}
