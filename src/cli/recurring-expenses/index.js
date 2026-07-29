import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listRecurringExpensesHandler } from './list.js';
import { showRecurringExpenseHandler } from './show.js';
import { addRecurringCommands } from '../utils/document-write.js';

export function buildRecurringExpensesSubcommands(yargs) {
  yargs
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
        localOptions(y.positional('id', { describe: 'Recurring expense id', type: 'string' }))
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showRecurringExpenseHandler),
    );

  addRecurringCommands(yargs, { namespace: 'recurringExpenses', label: 'recurring expense' });

  return yargs.demandCommand(1, 'Specify an action: list, show, stop, resume');
}
