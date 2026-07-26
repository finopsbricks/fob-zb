// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency, formatDate } from '../utils/format.js';

export async function showRecurringBillHandler(argv) {
  const zb = clientFor();
  const r = await zb.recurringBills.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(r, null, 2));
    return;
  }
  if (!r) {
    console.error(`No recurring bill found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', r.recurring_bill_id, w));
  console.log(formatField('Name', r.recurrence_name, w));
  console.log(formatField('Vendor', r.vendor_name, w));
  console.log(formatField('Status', r.status, w));
  console.log(formatField('Frequency', r.recurrence_frequency, w));
  console.log(formatField('Start Date', formatDate(r.start_date), w));
  console.log(formatField('Total', formatCurrency(r.total), w));
}
