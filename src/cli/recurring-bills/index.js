import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listRecurringBillsHandler } from './list.js';
import { showRecurringBillHandler } from './show.js';

export function buildRecurringBillsSubcommands(yargs) {
  return yargs
    .usage('$0 recurring-bills <action> [options]')
    .command(
      'list',
      'List recurring bills',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'active', 'stopped', 'expired'] })
          .option('vendor', { describe: 'Filter by vendor id', type: 'string' })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listRecurringBillsHandler),
    )
    .command(
      'show <id>',
      'Show a recurring bill by id',
      (y) =>
        y
          .positional('id', { describe: 'Recurring bill id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showRecurringBillHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
