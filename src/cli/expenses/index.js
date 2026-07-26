import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listExpensesHandler } from './list.js';
import { showExpenseHandler } from './show.js';

export function buildExpensesSubcommands(yargs) {
  return yargs
    .usage('$0 expenses <action> [options]')
    .command(
      'list',
      'List expenses',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', {
            describe: 'Filter by status',
            type: 'string',
            choices: ['all', 'billable', 'nonbillable', 'reimbursed', 'invoiced', 'unbilled'],
          })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listExpensesHandler),
    )
    .command(
      'show <id>',
      'Show an expense by id',
      (y) =>
        y
          .positional('id', { describe: 'Expense id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showExpenseHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
