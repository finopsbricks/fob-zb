import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listRecurringInvoicesHandler } from './list.js';
import { showRecurringInvoiceHandler } from './show.js';
import { addRecurringCommands } from '../utils/document-write.js';

export function buildRecurringInvoicesSubcommands(yargs) {
  yargs
    .usage('$0 recurring-invoices <action> [options]')
    .command(
      'list',
      'List recurring invoices',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'active', 'stopped', 'expired'] })
          .option('customer', { describe: 'Filter by customer id', type: 'string' })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listRecurringInvoicesHandler),
    )
    .command(
      'show <id>',
      'Show a recurring invoice by id',
      (y) =>
        y
          .positional('id', { describe: 'Recurring invoice id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showRecurringInvoiceHandler),
    );

  addRecurringCommands(yargs, { namespace: 'recurringInvoices', label: 'recurring invoice' });

  return yargs.demandCommand(1, 'Specify an action: list, show, stop, resume');
}
