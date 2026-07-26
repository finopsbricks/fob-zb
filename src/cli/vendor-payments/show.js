// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency, formatDate, formatSection, formatTable } from '../utils/format.js';

export async function showVendorPaymentHandler(argv) {
  const zb = clientFor();
  const p = await zb.vendorPayments.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(p, null, 2));
    return;
  }
  if (!p) {
    console.error(`No vendor payment found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', p.payment_id, w));
  console.log(formatField('Date', formatDate(p.date), w));
  console.log(formatField('Vendor', p.vendor_name, w));
  console.log(formatField('Mode', p.payment_mode, w));
  console.log(formatField('Reference', p.reference_number, w));
  console.log(formatField('Paid Through', p.paid_through_account_name, w));
  console.log(formatField('Amount', formatCurrency(p.amount), w));
  console.log(formatField('Unused', formatCurrency(p.unused_amount), w));

  const bills = p.bills ?? [];
  if (bills.length) {
    console.log(formatSection('Applied to Bills'));
    console.log(
      formatTable(
        ['BILL', 'DATE', 'APPLIED'],
        bills.map((b) => [b.bill_number ?? b.bill_id ?? '', formatDate(b.date), formatCurrency(b.amount_applied)]),
        { align: ['left', 'left', 'right'] },
      ),
    );
  }
}
