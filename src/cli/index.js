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
import { buildEstimatesSubcommands } from './estimates/index.js';
import { buildSalesOrdersSubcommands } from './sales-orders/index.js';
import { buildCreditNotesSubcommands } from './credit-notes/index.js';
import { buildRetainerInvoicesSubcommands } from './retainer-invoices/index.js';
import { buildVendorCreditsSubcommands } from './vendor-credits/index.js';
import { buildPurchaseOrdersSubcommands } from './purchase-orders/index.js';
import { buildRecurringInvoicesSubcommands } from './recurring-invoices/index.js';
import { buildRecurringBillsSubcommands } from './recurring-bills/index.js';
import { buildRecurringExpensesSubcommands } from './recurring-expenses/index.js';
import { buildJournalsSubcommands } from './journals/index.js';
import { buildProjectsSubcommands } from './projects/index.js';
import { buildTimeEntriesSubcommands } from './time-entries/index.js';
import { buildUsersSubcommands } from './users/index.js';
import { buildTaxesSubcommands } from './taxes/index.js';
import { buildCurrenciesSubcommands } from './currencies/index.js';
import { buildContactPersonsSubcommands } from './contact-persons/index.js';

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
    .command('estimates <action>', 'List/show estimates', buildEstimatesSubcommands)
    .command('sales-orders <action>', 'List/show sales orders', buildSalesOrdersSubcommands)
    .command('credit-notes <action>', 'List/show credit notes', buildCreditNotesSubcommands)
    .command('retainer-invoices <action>', 'List/show retainer invoices', buildRetainerInvoicesSubcommands)
    .command('vendor-credits <action>', 'List/show vendor credits', buildVendorCreditsSubcommands)
    .command('purchase-orders <action>', 'List/show purchase orders', buildPurchaseOrdersSubcommands)
    .command('recurring-invoices <action>', 'List/show recurring invoices', buildRecurringInvoicesSubcommands)
    .command('recurring-bills <action>', 'List/show recurring bills', buildRecurringBillsSubcommands)
    .command('recurring-expenses <action>', 'List/show recurring expenses', buildRecurringExpensesSubcommands)
    .command('journals <action>', 'List/show manual journals', buildJournalsSubcommands)
    .command('projects <action>', 'List/show projects', buildProjectsSubcommands)
    .command('time-entries <action>', 'List/show project time entries', buildTimeEntriesSubcommands)
    .command('users <action>', 'List/show users', buildUsersSubcommands)
    .command('taxes <action>', 'List/show taxes', buildTaxesSubcommands)
    .command('currencies <action>', 'List/show currencies', buildCurrenciesSubcommands)
    .command('contact-persons <action>', 'List/show contact persons', buildContactPersonsSubcommands)
    .demandCommand(1, 'Specify a resource. Try `fob-zb --help`.')
    .strict()
    .help()
    .alias('h', 'help')
    .version()
    .alias('v', 'version')
    // Global options (inherited by every command) render under their own
    // heading; each command's own options stay under "Options:", shown first
    // via localOptions() in the command builders.
    .group(['profile', 'help', 'version'], 'Global Options:')
    .parse();
}
