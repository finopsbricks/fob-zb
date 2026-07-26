// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency, formatDate, formatSection, formatTable } from '../utils/format.js';

export async function showVendorCreditHandler(argv) {
  const zb = clientFor();
  const vc = await zb.vendorCredits.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(vc, null, 2));
    return;
  }
  if (!vc) {
    console.error(`No vendor credit found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', vc.vendor_credit_id, w));
  console.log(formatField('Number', vc.vendor_credit_number, w));
  console.log(formatField('Vendor', vc.vendor_name, w));
  console.log(formatField('Status', vc.status, w));
  console.log(formatField('Date', formatDate(vc.date), w));
  console.log(formatField('Currency', vc.currency_code, w));
  console.log(formatField('Total', formatCurrency(vc.total), w));
  console.log(formatField('Balance', formatCurrency(vc.balance), w));

  const lines = vc.line_items ?? [];
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
