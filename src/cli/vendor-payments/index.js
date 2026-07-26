import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listVendorPaymentsHandler } from './list.js';
import { showVendorPaymentHandler } from './show.js';
import { createVendorPaymentHandler, deleteVendorPaymentHandler } from './create.js';

export function buildVendorPaymentsSubcommands(yargs) {
  return yargs
    .usage('$0 vendor-payments <action> [options]')
    .command(
      'list',
      'List vendor payments (payments made)',
      (y) => listOutputOptions(paginationOptions(y)).option('vendor', { describe: 'Filter by vendor id', type: 'string' }),
      safe(listVendorPaymentsHandler),
    )
    .command(
      'show <id>',
      'Show a vendor payment by id',
      (y) => y.positional('id', { describe: 'Payment id', type: 'string' }).option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showVendorPaymentHandler),
    )
    .command(
      'create',
      'Record a vendor payment (pay one or more bills)',
      (y) =>
        y
          .option('vendor', { describe: 'Vendor id', type: 'string', demandOption: true })
          .option('amount', { describe: 'Payment amount', type: 'number', demandOption: true })
          .option('date', { describe: 'Payment date (YYYY-MM-DD)', type: 'string', demandOption: true })
          .option('paid-through', { describe: 'Paying account id (bank/cash)', type: 'string', demandOption: true })
          .option('mode', { describe: 'Payment mode', type: 'string', default: 'cash' })
          .option('reference', { describe: 'Reference number', type: 'string' })
          .option('bill', { describe: 'Bill id to apply the full amount to', type: 'string' })
          .option('apply', { describe: 'Apply to bills: "bill_id=amount" (repeatable)', type: 'string', array: true })
          .option('json', { describe: 'Output raw JSON of the saved record', type: 'boolean' }),
      safe(createVendorPaymentHandler),
    )
    .command(
      'delete <id>',
      'Delete a vendor payment (requires --yes)',
      (y) => y.positional('id', { describe: 'Payment id', type: 'string' }).option('yes', { describe: 'Confirm deletion', type: 'boolean', alias: 'y' }),
      safe(deleteVendorPaymentHandler),
    )
    .demandCommand(1, 'Specify an action: list, show, create, delete');
}
