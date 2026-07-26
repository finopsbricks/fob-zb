import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listPurchaseOrdersHandler } from './list.js';
import { showPurchaseOrderHandler } from './show.js';

export function buildPurchaseOrdersSubcommands(yargs) {
  return yargs
    .usage('$0 purchase-orders <action> [options]')
    .command(
      'list',
      'List purchase orders',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'draft', 'open', 'billed', 'cancelled', 'pending_approval'] })
          .option('vendor', { describe: 'Filter by vendor id', type: 'string' })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listPurchaseOrdersHandler),
    )
    .command(
      'show <id>',
      'Show a purchase order by id (with line items)',
      (y) =>
        y
          .positional('id', { describe: 'Purchase order id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showPurchaseOrderHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
