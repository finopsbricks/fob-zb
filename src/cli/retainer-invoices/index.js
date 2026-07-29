import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listRetainerInvoicesHandler } from './list.js';
import { showRetainerInvoiceHandler } from './show.js';

export function buildRetainerInvoicesSubcommands(yargs) {
  return yargs
    .usage('$0 retainer-invoices <action> [options]')
    .command(
      'list',
      'List retainer invoices',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'draft', 'sent', 'paid', 'partially_paid', 'void', 'unpaid', 'overdue'] })
          .option('customer', { describe: 'Filter by customer id', type: 'string' })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listRetainerInvoicesHandler),
    )
    .command(
      'show <id>',
      'Show a retainer invoice by id (with line items)',
      (y) =>
        localOptions(y.positional('id', { describe: 'Retainer invoice id', type: 'string' }))
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showRetainerInvoiceHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
