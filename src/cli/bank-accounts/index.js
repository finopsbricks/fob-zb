import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listBankAccountsHandler } from './list.js';
import { showBankAccountHandler } from './show.js';

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
      (y) =>
        y
          .positional('id', { describe: 'Bank account id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showBankAccountHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
