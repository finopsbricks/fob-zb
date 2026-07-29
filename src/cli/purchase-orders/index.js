import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listPurchaseOrdersHandler } from './list.js';
import { showPurchaseOrderHandler } from './show.js';
import { addDocumentWriteCommands } from '../utils/document-write.js';

export function buildPurchaseOrdersSubcommands(yargs) {
  yargs
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
        localOptions(y.positional('id', { describe: 'Purchase order id', type: 'string' }))
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showPurchaseOrderHandler),
    );

  addDocumentWriteCommands(yargs, {
    namespace: 'purchaseOrders', label: 'purchase order', idField: 'purchaseorder_id', numberField: 'purchaseorder_number',
    partyField: 'vendor_id', partyArgKey: 'vendor',
    statuses: [
      { verb: 'mark-open', state: 'open', desc: 'Mark as open (issued)', msg: (id) => `Marked purchase order ${id} as open.` },
      { verb: 'mark-billed', state: 'billed', desc: 'Mark as billed', msg: (id) => `Marked purchase order ${id} as billed.` },
      { verb: 'mark-cancelled', state: 'cancelled', desc: 'Cancel the purchase order', msg: (id) => `Cancelled purchase order ${id}.` },
    ],
  });

  return yargs.demandCommand(1, 'Specify an action: list, show, create, edit, delete, mark-open, mark-billed, mark-cancelled, submit, approve, email');
}
