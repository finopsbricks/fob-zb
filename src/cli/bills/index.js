import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listBillsHandler } from './list.js';
import { showBillHandler } from './show.js';

export function buildBillsSubcommands(yargs) {
  return yargs
    .usage('$0 bills <action> [options]')
    .command(
      'list',
      'List bills (vendor payables)',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', {
            describe: 'Filter by status',
            type: 'string',
            choices: ['all', 'draft', 'open', 'overdue', 'paid', 'partially_paid', 'void'],
          })
          .option('vendor', { describe: 'Filter by vendor id', type: 'string' })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listBillsHandler),
    )
    .command(
      'show <id>',
      'Show a bill by id (with line items)',
      (y) =>
        y
          .positional('id', { describe: 'Bill id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showBillHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
