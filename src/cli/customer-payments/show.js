// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency, formatDate, formatSection, formatTable } from '../utils/format.js';

export async function showCustomerPaymentHandler(argv) {
  const zb = clientFor();
  const p = await zb.customerPayments.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(p, null, 2));
    return;
  }
  if (!p) {
    console.error(`No customer payment found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', p.payment_id, w));
  console.log(formatField('Number', p.payment_number, w));
  console.log(formatField('Date', formatDate(p.date), w));
  console.log(formatField('Customer', p.customer_name, w));
  console.log(formatField('Mode', p.payment_mode, w));
  console.log(formatField('Reference', p.reference_number, w));
  console.log(formatField('Deposit To', p.account_name, w));
  console.log(formatField('Amount', formatCurrency(p.amount), w));
  console.log(formatField('Unused', formatCurrency(p.unused_amount), w));

  const applied = p.invoices ?? p.applied_invoices ?? [];
  if (applied.length) {
    console.log(formatSection('Applied to Invoices'));
    console.log(
      formatTable(
        ['INVOICE', 'DATE', 'APPLIED'],
        applied.map((a) => [
          a.invoice_number ?? a.invoice_id ?? '',
          formatDate(a.date),
          formatCurrency(a.amount_applied),
        ]),
        { align: ['left', 'left', 'right'] },
      ),
    );
  }
}
