import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listBankAccountsHandler } from './list.js';
import { showBankAccountHandler } from './show.js';
import { bankAccountFieldOptions, buildBankAccountBody, BANK_ACCOUNT_TYPES } from './_body.js';
import { makeWriteHandlers } from '../utils/write-commands.js';

const w = makeWriteHandlers({ namespace: 'bankAccounts', label: 'bank account', idField: 'account_id', buildBody: buildBankAccountBody });

export function buildBankAccountsSubcommands(yargs) {
  return yargs
    .usage('$0 bank-accounts <action> [options]')
    .command(
      'list',
      'List bank & credit-card accounts',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'active', 'inactive'] }),
      safe(listBankAccountsHandler),
    )
    .command(
      'show <id>',
      'Show a bank account by id',
      (y) => y.positional('id', { describe: 'Bank account id', type: 'string' }).option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showBankAccountHandler),
    )
    .command(
      'create',
      'Create a bank / credit-card account',
      (y) =>
        bankAccountFieldOptions(y)
          .option('name', { describe: 'Account name', type: 'string', demandOption: true })
          .option('type', { describe: 'Account type', type: 'string', choices: BANK_ACCOUNT_TYPES, demandOption: true }),
      safe(w.create),
    )
    .command(
      'edit <id>',
      'Update a bank account (only passed flags change)',
      (y) =>
        bankAccountFieldOptions(y)
          .positional('id', { describe: 'Bank account id', type: 'string' })
          .option('name', { describe: 'Account name', type: 'string' })
          .option('type', { describe: 'Account type', type: 'string', choices: BANK_ACCOUNT_TYPES }),
      safe(w.edit),
    )
    .command(
      'delete <id>',
      'Delete a bank account (requires --yes)',
      (y) => y.positional('id', { describe: 'Bank account id', type: 'string' }).option('yes', { describe: 'Confirm deletion', type: 'boolean', alias: 'y' }),
      safe(w.remove),
    )
    .command('activate <id>', 'Mark a bank account active', (y) => y.positional('id', { describe: 'Bank account id', type: 'string' }), safe(w.activate))
    .command('deactivate <id>', 'Mark a bank account inactive', (y) => y.positional('id', { describe: 'Bank account id', type: 'string' }), safe(w.deactivate))
    .demandCommand(1, 'Specify an action: list, show, create, edit, delete, activate, deactivate');
}
