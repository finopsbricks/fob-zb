// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency, formatDate, formatSection, formatTable } from '../utils/format.js';

export async function showSalesOrderHandler(argv) {
  const zb = clientFor();
  const so = await zb.salesOrders.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(so, null, 2));
    return;
  }
  if (!so) {
    console.error(`No sales order found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', so.salesorder_id, w));
  console.log(formatField('Number', so.salesorder_number, w));
  console.log(formatField('Customer', so.customer_name, w));
  console.log(formatField('Status', so.status, w));
  console.log(formatField('Date', formatDate(so.date), w));
  console.log(formatField('Reference', so.reference_number, w));
  console.log(formatField('Currency', so.currency_code, w));
  console.log(formatField('Sub Total', formatCurrency(so.sub_total), w));
  console.log(formatField('Total', formatCurrency(so.total), w));

  const lines = so.line_items ?? [];
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
