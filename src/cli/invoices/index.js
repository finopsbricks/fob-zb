import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listInvoicesHandler } from './list.js';
import { showInvoiceHandler } from './show.js';

export function buildInvoicesSubcommands(yargs) {
  return yargs
    .usage('$0 invoices <action> [options]')
    .command(
      'list',
      'List invoices',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', {
            describe: 'Filter by status',
            type: 'string',
            choices: ['all', 'sent', 'draft', 'overdue', 'paid', 'partially_paid', 'void', 'unpaid', 'viewed'],
          })
          .option('customer', { describe: 'Filter by customer id', type: 'string' })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listInvoicesHandler),
    )
    .command(
      'show <id>',
      'Show an invoice by id (with line items)',
      (y) =>
        y
          .positional('id', { describe: 'Invoice id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showInvoiceHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
