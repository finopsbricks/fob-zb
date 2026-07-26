// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency } from '../utils/format.js';

export async function showBankAccountHandler(argv) {
  const zb = clientFor();
  const a = await zb.bankAccounts.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(a, null, 2));
    return;
  }
  if (!a) {
    console.error(`No bank account found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 22;
  console.log(formatField('ID', a.account_id, w));
  console.log(formatField('Name', a.account_name, w));
  console.log(formatField('Code', a.account_code, w));
  console.log(formatField('Type', a.account_type, w));
  console.log(formatField('Sub-type', a.account_sub_type, w));
  console.log(formatField('Bank', a.bank_name, w));
  console.log(formatField('Currency', a.currency_code, w));
  console.log(formatField('Balance', formatCurrency(a.balance), w));
  console.log(formatField('Bank Balance', formatCurrency(a.bank_balance), w));
  console.log(formatField('Active', a.is_active ? 'yes' : 'no', w));
  console.log(formatField('Uncategorized', a.uncategorized_transactions, w));
}
