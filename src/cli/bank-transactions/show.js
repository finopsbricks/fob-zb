// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency, formatDate } from '../utils/format.js';

export async function showBankTransactionHandler(argv) {
  const zb = clientFor();
  const t = await zb.bankTransactions.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(t, null, 2));
    return;
  }
  if (!t) {
    console.error(`No bank transaction found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 20;
  console.log(formatField('ID', t.transaction_id, w));
  console.log(formatField('Date', formatDate(t.date), w));
  console.log(formatField('Type', t.transaction_type, w));
  console.log(formatField('Amount', formatCurrency(t.amount), w));
  console.log(formatField('Debit/Credit', t.debit_or_credit, w));
  console.log(formatField('Status', t.status, w));
  console.log(formatField('Account', t.account_name, w));
  console.log(formatField('Payee', t.payee, w));
  console.log(formatField('Reference', t.reference_number, w));
  console.log(formatField('Offset Account', t.offset_account_name, w));
  console.log(formatField('Currency', t.currency_code, w));
  console.log(formatField('Description', t.description, w));
}
