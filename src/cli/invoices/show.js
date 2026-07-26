// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency, formatDate, formatSection, formatTable } from '../utils/format.js';

export async function showInvoiceHandler(argv) {
  const zb = clientFor();
  const inv = await zb.invoices.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(inv, null, 2));
    return;
  }
  if (!inv) {
    console.error(`No invoice found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', inv.invoice_id, w));
  console.log(formatField('Number', inv.invoice_number, w));
  console.log(formatField('Customer', inv.customer_name, w));
  console.log(formatField('Status', inv.status, w));
  console.log(formatField('Date', formatDate(inv.date), w));
  console.log(formatField('Due Date', formatDate(inv.due_date), w));
  console.log(formatField('Reference', inv.reference_number, w));
  console.log(formatField('Currency', inv.currency_code, w));
  console.log(formatField('Sub Total', formatCurrency(inv.sub_total), w));
  console.log(formatField('Total', formatCurrency(inv.total), w));
  console.log(formatField('Balance', formatCurrency(inv.balance), w));

  const lines = inv.line_items ?? [];
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
