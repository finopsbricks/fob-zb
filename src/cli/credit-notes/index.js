import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listCreditNotesHandler } from './list.js';
import { showCreditNoteHandler } from './show.js';

export function buildCreditNotesSubcommands(yargs) {
  return yargs
    .usage('$0 credit-notes <action> [options]')
    .command(
      'list',
      'List credit notes',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'open', 'closed', 'void', 'draft'] })
          .option('customer', { describe: 'Filter by customer id', type: 'string' })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listCreditNotesHandler),
    )
    .command(
      'show <id>',
      'Show a credit note by id (with line items)',
      (y) =>
        y
          .positional('id', { describe: 'Credit note id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showCreditNoteHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
