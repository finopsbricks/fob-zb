// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency } from '../utils/format.js';

export async function showItemHandler(argv) {
  const zb = clientFor();
  const it = await zb.items.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(it, null, 2));
    return;
  }
  if (!it) {
    console.error(`No item found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 20;
  console.log(formatField('ID', it.item_id, w));
  console.log(formatField('Name', it.name, w));
  console.log(formatField('SKU', it.sku, w));
  console.log(formatField('Unit', it.unit, w));
  console.log(formatField('Status', it.status, w));
  console.log(formatField('Product Type', it.product_type, w));
  console.log(formatField('Item Type', it.item_type, w));
  console.log(formatField('Sales Rate', formatCurrency(it.rate), w));
  console.log(formatField('Purchase Rate', formatCurrency(it.purchase_rate), w));
  console.log(formatField('Sales Account', it.account_name, w));
  console.log(formatField('Purchase Account', it.purchase_account_name, w));
  console.log(formatField('Tax', it.tax_name, w));
  console.log(formatField('Description', it.description, w));
}
