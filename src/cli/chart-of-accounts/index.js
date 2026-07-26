import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listChartOfAccountsHandler } from './list.js';
import { showChartOfAccountHandler } from './show.js';
import { accountFieldOptions, buildAccountBody, ACCOUNT_TYPES } from './_body.js';
import { makeWriteHandlers } from '../utils/write-commands.js';

const w = makeWriteHandlers({ namespace: 'chartOfAccounts', label: 'account', idField: 'account_id', buildBody: buildAccountBody });

export function buildChartOfAccountsSubcommands(yargs) {
  return yargs
    .usage('$0 chart-of-accounts <action> [options]')
    .command(
      'list',
      'List chart-of-accounts (general ledger)',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('type', {
            describe: 'Filter by account type / status',
            type: 'string',
            choices: ['all', 'active', 'inactive', 'asset', 'liability', 'equity', 'income', 'expense'],
          })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listChartOfAccountsHandler),
    )
    .command(
      'show <id>',
      'Show a ledger account by id',
      (y) => y.positional('id', { describe: 'Account id', type: 'string' }).option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showChartOfAccountHandler),
    )
    .command(
      'create',
      'Create a ledger account',
      (y) =>
        accountFieldOptions(y)
          .option('name', { describe: 'Account name', type: 'string', demandOption: true })
          .option('type', { describe: 'Account type', type: 'string', choices: ACCOUNT_TYPES, demandOption: true }),
      safe(w.create),
    )
    .command(
      'edit <id>',
      'Update a ledger account (only passed flags change)',
      (y) =>
        accountFieldOptions(y)
          .positional('id', { describe: 'Account id', type: 'string' })
          .option('name', { describe: 'Account name', type: 'string' })
          .option('type', { describe: 'Account type', type: 'string', choices: ACCOUNT_TYPES }),
      safe(w.edit),
    )
    .command(
      'delete <id>',
      'Delete a ledger account (requires --yes)',
      (y) => y.positional('id', { describe: 'Account id', type: 'string' }).option('yes', { describe: 'Confirm deletion', type: 'boolean', alias: 'y' }),
      safe(w.remove),
    )
    .command('activate <id>', 'Mark an account active', (y) => y.positional('id', { describe: 'Account id', type: 'string' }), safe(w.activate))
    .command('deactivate <id>', 'Mark an account inactive', (y) => y.positional('id', { describe: 'Account id', type: 'string' }), safe(w.deactivate))
    .demandCommand(1, 'Specify an action: list, show, create, edit, delete, activate, deactivate');
}
