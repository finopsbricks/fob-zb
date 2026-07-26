import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listEstimatesHandler } from './list.js';
import { showEstimateHandler } from './show.js';

export function buildEstimatesSubcommands(yargs) {
  return yargs
    .usage('$0 estimates <action> [options]')
    .command(
      'list',
      'List estimates',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'draft', 'sent', 'invoiced', 'accepted', 'declined', 'expired'] })
          .option('customer', { describe: 'Filter by customer id', type: 'string' })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listEstimatesHandler),
    )
    .command(
      'show <id>',
      'Show an estimate by id (with line items)',
      (y) =>
        y
          .positional('id', { describe: 'Estimate id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showEstimateHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
