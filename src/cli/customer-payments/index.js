import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listCustomerPaymentsHandler } from './list.js';
import { showCustomerPaymentHandler } from './show.js';

export function buildCustomerPaymentsSubcommands(yargs) {
  return yargs
    .usage('$0 customer-payments <action> [options]')
    .command(
      'list',
      'List customer payments (payments received)',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('customer', { describe: 'Filter by customer id', type: 'string' })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listCustomerPaymentsHandler),
    )
    .command(
      'show <id>',
      'Show a customer payment by id',
      (y) =>
        localOptions(y.positional('id', { describe: 'Payment id', type: 'string' }))
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showCustomerPaymentHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
