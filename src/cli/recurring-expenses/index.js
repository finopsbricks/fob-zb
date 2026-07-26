import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listRecurringExpensesHandler } from './list.js';
import { showRecurringExpenseHandler } from './show.js';

export function buildRecurringExpensesSubcommands(yargs) {
  return yargs
    .usage('$0 recurring-expenses <action> [options]')
    .command(
      'list',
      'List recurring expenses',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'active', 'stopped', 'expired'] })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listRecurringExpensesHandler),
    )
    .command(
      'show <id>',
      'Show a recurring expense by id',
      (y) =>
        y
          .positional('id', { describe: 'Recurring expense id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showRecurringExpenseHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
