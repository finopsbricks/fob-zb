// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency, formatDate, formatSection, formatTable } from '../utils/format.js';

export async function showPurchaseOrderHandler(argv) {
  const zb = clientFor();
  const po = await zb.purchaseOrders.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(po, null, 2));
    return;
  }
  if (!po) {
    console.error(`No purchase order found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', po.purchaseorder_id, w));
  console.log(formatField('Number', po.purchaseorder_number, w));
  console.log(formatField('Vendor', po.vendor_name, w));
  console.log(formatField('Status', po.status, w));
  console.log(formatField('Date', formatDate(po.date), w));
  console.log(formatField('Reference', po.reference_number, w));
  console.log(formatField('Currency', po.currency_code, w));
  console.log(formatField('Sub Total', formatCurrency(po.sub_total), w));
  console.log(formatField('Total', formatCurrency(po.total), w));

  const lines = po.line_items ?? [];
  if (lines.length) {
    console.log(formatSection('Line Items'));
    console.log(
      formatTable(
        ['ITEM', 'QTY', 'RATE', 'TAX%', 'AMOUNT'],
        lines.map((l) => [
          l.name ?? l.description ?? '',
          String(l.quantity ?? ''),
          formatCurrency(l.rate),
          String(l.tax_percentage ?? ''),
          formatCurrency(l.item_total),
        ]),
        { align: ['left', 'right', 'right', 'right', 'right'] },
      ),
    );
  }
}
