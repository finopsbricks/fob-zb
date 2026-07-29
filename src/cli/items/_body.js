// @ts-check
/** Shared item write-field options + argv→Zoho-body mapping (create/edit). */

import { localOptions } from '../_helpers.js';

export function itemFieldOptions(yargs) {
  return localOptions(yargs)
    .option('rate', { describe: 'Sales rate', type: 'number' })
    .option('sku', { describe: 'SKU', type: 'string' })
    .option('unit', { describe: 'Unit (e.g. pcs, hrs)', type: 'string' })
    .option('description', { describe: 'Description', type: 'string' })
    .option('product-type', { describe: 'Product type', type: 'string', choices: ['goods', 'service'] })
    .option('item-type', { describe: 'Item type', type: 'string', choices: ['sales', 'purchases', 'sales_and_purchases', 'inventory'] })
    .option('purchase-rate', { describe: 'Purchase rate', type: 'number' })
    .option('json', { describe: 'Output raw JSON of the saved record', type: 'boolean' });
}

export function buildItemBody(argv) {
  const b = {};
  if (argv.name !== undefined) b.name = argv.name;
  if (argv.rate !== undefined) b.rate = argv.rate;
  if (argv.sku !== undefined) b.sku = argv.sku;
  if (argv.unit !== undefined) b.unit = argv.unit;
  if (argv.description !== undefined) b.description = argv.description;
  if (argv.productType !== undefined) b.product_type = argv.productType;
  if (argv.itemType !== undefined) b.item_type = argv.itemType;
  if (argv.purchaseRate !== undefined) b.purchase_rate = argv.purchaseRate;
  return b;
}
