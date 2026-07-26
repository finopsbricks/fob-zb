// @ts-check
/** Shared bank-account write-field options + argv→Zoho-body mapping. */

export const BANK_ACCOUNT_TYPES = ['bank', 'credit_card'];

export function bankAccountFieldOptions(yargs) {
  return yargs
    .option('code', { describe: 'Account code', type: 'string' })
    .option('account-number', { describe: 'Account number', type: 'string' })
    .option('description', { describe: 'Description', type: 'string' })
    .option('json', { describe: 'Output raw JSON of the saved record', type: 'boolean' });
}

export function buildBankAccountBody(argv) {
  const b = {};
  if (argv.name !== undefined) b.account_name = argv.name;
  if (argv.type !== undefined) b.account_type = argv.type;
  if (argv.code !== undefined) b.account_code = argv.code;
  if (argv.accountNumber !== undefined) b.account_number = argv.accountNumber;
  if (argv.description !== undefined) b.description = argv.description;
  return b;
}
