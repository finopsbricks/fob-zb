// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency, formatDate, formatSection, formatTable } from '../utils/format.js';

export async function showCreditNoteHandler(argv) {
  const zb = clientFor();
  const cn = await zb.creditNotes.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(cn, null, 2));
    return;
  }
  if (!cn) {
    console.error(`No credit note found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', cn.creditnote_id, w));
  console.log(formatField('Number', cn.creditnote_number, w));
  console.log(formatField('Customer', cn.customer_name, w));
  console.log(formatField('Status', cn.status, w));
  console.log(formatField('Date', formatDate(cn.date), w));
  console.log(formatField('Currency', cn.currency_code, w));
  console.log(formatField('Sub Total', formatCurrency(cn.sub_total), w));
  console.log(formatField('Total', formatCurrency(cn.total), w));
  console.log(formatField('Balance', formatCurrency(cn.balance), w));

  const lines = cn.line_items ?? [];
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
