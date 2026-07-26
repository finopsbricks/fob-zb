// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency, formatDate } from '../utils/format.js';

export async function showExpenseHandler(argv) {
  const zb = clientFor();
  const e = await zb.expenses.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(e, null, 2));
    return;
  }
  if (!e) {
    console.error(`No expense found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 20;
  console.log(formatField('ID', e.expense_id, w));
  console.log(formatField('Date', formatDate(e.date), w));
  console.log(formatField('Expense Account', e.account_name, w));
  console.log(formatField('Paid Through', e.paid_through_account_name, w));
  console.log(formatField('Vendor', e.vendor_name, w));
  console.log(formatField('Customer', e.customer_name, w));
  console.log(formatField('Status', e.status, w));
  console.log(formatField('Billable', e.is_billable ? 'yes' : 'no', w));
  console.log(formatField('Reference', e.reference_number, w));
  console.log(formatField('Currency', e.currency_code, w));
  console.log(formatField('Total', formatCurrency(e.total), w));
  console.log(formatField('Description', e.description, w));
}
