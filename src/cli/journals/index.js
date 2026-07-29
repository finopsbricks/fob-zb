import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listJournalsHandler } from './list.js';
import { showJournalHandler } from './show.js';

export function buildJournalsSubcommands(yargs) {
  return yargs
    .usage('$0 journals <action> [options]')
    .command(
      'list',
      'List journals (manual journal entries)',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'draft', 'published'] }),
      safe(listJournalsHandler),
    )
    .command(
      'show <id>',
      'Show a journal by id (with line items)',
      (y) =>
        localOptions(y.positional('id', { describe: 'Journal id', type: 'string' }))
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showJournalHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
