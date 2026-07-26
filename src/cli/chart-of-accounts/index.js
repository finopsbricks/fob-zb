import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listChartOfAccountsHandler } from './list.js';
import { showChartOfAccountHandler } from './show.js';

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
      (y) =>
        y
          .positional('id', { describe: 'Account id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showChartOfAccountHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
