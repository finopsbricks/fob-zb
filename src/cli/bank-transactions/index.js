import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listBankTransactionsHandler } from './list.js';
import { showBankTransactionHandler } from './show.js';

export function buildBankTransactionsSubcommands(yargs) {
  return yargs
    .usage('$0 bank-transactions <action> [options]')
    .command(
      'list',
      'List bank / credit-card feed transactions',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('account-id', { describe: 'Filter by bank account id', type: 'string' })
          .option('status', {
            describe: 'Filter by categorization status',
            type: 'string',
            choices: ['all', 'uncategorized', 'categorized', 'matched', 'excluded'],
          }),
      safe(listBankTransactionsHandler),
    )
    .command(
      'show <id>',
      'Show a bank transaction by id',
      (y) =>
        y
          .positional('id', { describe: 'Transaction id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showBankTransactionHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
