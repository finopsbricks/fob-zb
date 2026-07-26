// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField } from '../utils/format.js';

export async function showTaxHandler(argv) {
  const zb = clientFor();
  const t = await zb.taxes.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(t, null, 2));
    return;
  }
  if (!t) {
    console.error(`No tax found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', t.tax_id, w));
  console.log(formatField('Name', t.tax_name, w));
  console.log(formatField('Percentage', t.tax_percentage, w));
  console.log(formatField('Type', t.tax_type, w));
}
