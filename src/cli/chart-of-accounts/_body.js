// @ts-check
/** Shared chart-of-accounts write-field options + argv→Zoho-body mapping. */

// User-creatable account types (system types like input_tax are not creatable here).
export const ACCOUNT_TYPES = [
  'other_asset', 'other_current_asset', 'cash', 'bank', 'fixed_asset', 'accounts_receivable',
  'other_current_liability', 'credit_card', 'long_term_liability', 'accounts_payable',
  'equity', 'income', 'other_income', 'expense', 'cost_of_goods_sold', 'other_expense',
];

export function accountFieldOptions(yargs) {
  return yargs
    .option('code', { describe: 'Account code', type: 'string' })
    .option('description', { describe: 'Description', type: 'string' })
    .option('parent', { describe: 'Parent account id', type: 'string' })
    .option('json', { describe: 'Output raw JSON of the saved record', type: 'boolean' });
}

export function buildAccountBody(argv) {
  const b = {};
  if (argv.name !== undefined) b.account_name = argv.name;
  if (argv.type !== undefined) b.account_type = argv.type;
  if (argv.code !== undefined) b.account_code = argv.code;
  if (argv.description !== undefined) b.description = argv.description;
  if (argv.parent !== undefined) b.parent_account_id = argv.parent;
  return b;
}
