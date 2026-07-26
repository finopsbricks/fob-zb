/**
 * CLI entry point:
 *
 *   fob-zb <resource> <action> [target] [options]
 *
 * A Zoho Books wrapper. Credentials come from ~/.fob/fob-zb/config.yml (managed
 * by `config`) or FOB_ZB_* env; OAuth token refresh is handled by the client.
 * `--profile <name>` overrides the active profile for one command.
 */

import yargs from 'yargs';

import { setProfileOverride } from './config-store.js';
import { buildConfigSubcommands } from './config/index.js';
import { buildAuthSubcommands } from './auth/index.js';
import { buildOrganizationsSubcommands } from './organizations/index.js';
import { buildContactsSubcommands } from './contacts/index.js';
import { buildInvoicesSubcommands } from './invoices/index.js';
import { buildBillsSubcommands } from './bills/index.js';
import { buildExpensesSubcommands } from './expenses/index.js';
import { buildItemsSubcommands } from './items/index.js';
import { buildCustomerPaymentsSubcommands } from './customer-payments/index.js';
import { buildChartOfAccountsSubcommands } from './chart-of-accounts/index.js';
import { buildBankAccountsSubcommands } from './bank-accounts/index.js';
import { buildBankTransactionsSubcommands } from './bank-transactions/index.js';
import { buildVendorPaymentsSubcommands } from './vendor-payments/index.js';

export function run(argv) {
  return yargs(argv)
    .scriptName('fob-zb')
    .usage('$0 <resource> <action> [target] [options]')
    .option('profile', {
      alias: 'org',
      describe: 'Use credentials from a specific configured profile (overrides current + env)',
      type: 'string',
    })
    .middleware((argv) => {
      if (argv.profile) setProfileOverride(argv.profile);
    })
    .command('config <resource>', 'Manage credential profiles (alias: orgs)', buildConfigSubcommands)
    .command('auth <action>', 'OAuth token operations (status, refresh, logout)', buildAuthSubcommands)
    .command('organizations <action>', 'List/show Zoho organizations (tenants)', buildOrganizationsSubcommands)
    .command('contacts <action>', 'List/show contacts (customers & vendors)', buildContactsSubcommands)
    .command('invoices <action>', 'List/show invoices', buildInvoicesSubcommands)
    .command('bills <action>', 'List/show vendor bills', buildBillsSubcommands)
    .command('expenses <action>', 'List/show expenses', buildExpensesSubcommands)
    .command('items <action>', 'List/show items (products & services)', buildItemsSubcommands)
    .command('customer-payments <action>', 'List/show customer payments', buildCustomerPaymentsSubcommands)
    .command('chart-of-accounts <action>', 'List/show ledger accounts', buildChartOfAccountsSubcommands)
    .command('bank-accounts <action>', 'List/show bank & credit-card accounts', buildBankAccountsSubcommands)
    .command('bank-transactions <action>', 'List/show bank feed transactions', buildBankTransactionsSubcommands)
    .command('vendor-payments <action>', 'List/show/record vendor payments', buildVendorPaymentsSubcommands)
    .demandCommand(1, 'Specify a resource. Try `fob-zb --help`.')
    .strict()
    .help()
    .alias('h', 'help')
    .version()
    .alias('v', 'version')
    .parse();
}
