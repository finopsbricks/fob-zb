// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency, formatDate, formatSection, formatTable } from '../utils/format.js';

export async function showRetainerInvoiceHandler(argv) {
  const zb = clientFor();
  const ri = await zb.retainerInvoices.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(ri, null, 2));
    return;
  }
  if (!ri) {
    console.error(`No retainer invoice found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', ri.retainerinvoice_id, w));
  console.log(formatField('Number', ri.retainerinvoice_number, w));
  console.log(formatField('Customer', ri.customer_name, w));
  console.log(formatField('Status', ri.status, w));
  console.log(formatField('Date', formatDate(ri.date), w));
  console.log(formatField('Currency', ri.currency_code, w));
  console.log(formatField('Sub Total', formatCurrency(ri.sub_total), w));
  console.log(formatField('Total', formatCurrency(ri.total), w));
  console.log(formatField('Balance', formatCurrency(ri.balance), w));

  const lines = ri.line_items ?? [];
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
