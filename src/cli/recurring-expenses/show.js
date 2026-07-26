// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency } from '../utils/format.js';

export async function showRecurringExpenseHandler(argv) {
  const zb = clientFor();
  const r = await zb.recurringExpenses.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(r, null, 2));
    return;
  }
  if (!r) {
    console.error(`No recurring expense found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', r.recurring_expense_id, w));
  console.log(formatField('Name', r.recurrence_name, w));
  console.log(formatField('Account', r.account_name, w));
  console.log(formatField('Status', r.status, w));
  console.log(formatField('Frequency', r.recurrence_frequency, w));
  console.log(formatField('Total', formatCurrency(r.total), w));
}
