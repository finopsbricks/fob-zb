// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency, formatDate, formatSection, formatTable } from '../utils/format.js';

export async function showBillHandler(argv) {
  const zb = clientFor();
  const bill = await zb.bills.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(bill, null, 2));
    return;
  }
  if (!bill) {
    console.error(`No bill found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', bill.bill_id, w));
  console.log(formatField('Number', bill.bill_number, w));
  console.log(formatField('Vendor', bill.vendor_name, w));
  console.log(formatField('Status', bill.status, w));
  console.log(formatField('Date', formatDate(bill.date), w));
  console.log(formatField('Due Date', formatDate(bill.due_date), w));
  console.log(formatField('Reference', bill.reference_number, w));
  console.log(formatField('Currency', bill.currency_code, w));
  console.log(formatField('Sub Total', formatCurrency(bill.sub_total), w));
  console.log(formatField('Total', formatCurrency(bill.total), w));
  console.log(formatField('Balance', formatCurrency(bill.balance), w));

  const lines = bill.line_items ?? [];
  if (lines.length) {
    console.log(formatSection('Line Items'));
    console.log(
      formatTable(
        ['ACCOUNT', 'DESCRIPTION', 'QTY', 'RATE', 'AMOUNT'],
        lines.map((l) => [
          l.account_name ?? '',
          (l.name || l.description || '').slice(0, 40),
          String(l.quantity ?? ''),
          formatCurrency(l.rate),
          formatCurrency(l.item_total),
        ]),
        { align: ['left', 'left', 'right', 'right', 'right'] },
      ),
    );
  }
}
