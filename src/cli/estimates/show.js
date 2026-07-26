// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency, formatDate, formatSection, formatTable } from '../utils/format.js';

export async function showEstimateHandler(argv) {
  const zb = clientFor();
  const est = await zb.estimates.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(est, null, 2));
    return;
  }
  if (!est) {
    console.error(`No estimate found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', est.estimate_id, w));
  console.log(formatField('Number', est.estimate_number, w));
  console.log(formatField('Customer', est.customer_name, w));
  console.log(formatField('Status', est.status, w));
  console.log(formatField('Date', formatDate(est.date), w));
  console.log(formatField('Reference', est.reference_number, w));
  console.log(formatField('Currency', est.currency_code, w));
  console.log(formatField('Sub Total', formatCurrency(est.sub_total), w));
  console.log(formatField('Total', formatCurrency(est.total), w));

  const lines = est.line_items ?? [];
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
