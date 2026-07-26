import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listSalesOrdersHandler } from './list.js';
import { showSalesOrderHandler } from './show.js';

export function buildSalesOrdersSubcommands(yargs) {
  return yargs
    .usage('$0 sales-orders <action> [options]')
    .command(
      'list',
      'List sales orders',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'draft', 'open', 'invoiced', 'partially_invoiced', 'closed', 'void'] })
          .option('customer', { describe: 'Filter by customer id', type: 'string' })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listSalesOrdersHandler),
    )
    .command(
      'show <id>',
      'Show a sales order by id (with line items)',
      (y) =>
        y
          .positional('id', { describe: 'Sales order id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showSalesOrderHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
