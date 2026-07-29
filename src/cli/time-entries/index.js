import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listTimeEntriesHandler } from './list.js';
import { showTimeEntryHandler } from './show.js';

export function buildTimeEntriesSubcommands(yargs) {
  return yargs
    .usage('$0 time-entries <action> [options]')
    .command(
      'list',
      'List time entries',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('project', { describe: 'Filter by project id', type: 'string' })
          .option('user', { describe: 'Filter by user id', type: 'string' }),
      safe(listTimeEntriesHandler),
    )
    .command(
      'show <id>',
      'Show a time entry by id',
      (y) =>
        localOptions(y.positional('id', { describe: 'Time entry id', type: 'string' }))
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showTimeEntryHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
