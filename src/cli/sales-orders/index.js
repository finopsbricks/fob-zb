import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listSalesOrdersHandler } from './list.js';
import { showSalesOrderHandler } from './show.js';
import { addDocumentWriteCommands } from '../utils/document-write.js';

export function buildSalesOrdersSubcommands(yargs) {
  yargs
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
        localOptions(y.positional('id', { describe: 'Sales order id', type: 'string' }))
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showSalesOrderHandler),
    );

  addDocumentWriteCommands(yargs, {
    namespace: 'salesOrders', label: 'sales order', idField: 'salesorder_id', numberField: 'salesorder_number',
    partyField: 'customer_id', partyArgKey: 'customer',
    statuses: [
      { verb: 'mark-open', state: 'open', desc: 'Mark as open', msg: (id) => `Marked sales order ${id} as open.` },
      { verb: 'mark-void', state: 'void', desc: 'Void the sales order', msg: (id) => `Voided sales order ${id}.` },
    ],
  });

  return yargs.demandCommand(1, 'Specify an action: list, show, create, edit, delete, mark-open, mark-void, submit, approve, email');
}
