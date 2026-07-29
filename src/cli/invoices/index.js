import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listInvoicesHandler } from './list.js';
import { showInvoiceHandler } from './show.js';
import { invoiceFieldOptions } from './_body.js';
import {
  createInvoiceHandler,
  editInvoiceHandler,
  deleteInvoiceHandler,
  markSentInvoiceHandler,
  markVoidInvoiceHandler,
  emailInvoiceHandler,
  writeoffInvoiceHandler,
  cancelWriteoffInvoiceHandler,
} from './write.js';

const idPos = (y, label = 'Invoice id') => y.positional('id', { describe: label, type: 'string' });

export function buildInvoicesSubcommands(yargs) {
  return yargs
    .usage('$0 invoices <action> [options]')
    .command(
      'list',
      'List invoices',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'sent', 'draft', 'overdue', 'paid', 'partially_paid', 'void', 'unpaid', 'viewed'] })
          .option('customer', { describe: 'Filter by customer id', type: 'string' })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listInvoicesHandler),
    )
    .command(
      'show <id>',
      'Show an invoice by id (with line items)',
      (y) => localOptions(idPos(y)).option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showInvoiceHandler),
    )
    .command(
      'create',
      'Create an invoice',
      (y) => invoiceFieldOptions(y).option('customer', { describe: 'Customer id', type: 'string', demandOption: true }),
      safe(createInvoiceHandler),
    )
    .command(
      'edit <id>',
      'Update an invoice (only passed flags change)',
      (y) => invoiceFieldOptions(idPos(y)).option('customer', { describe: 'Customer id', type: 'string' }),
      safe(editInvoiceHandler),
    )
    .command('delete <id>', 'Delete an invoice (requires --yes)', (y) => localOptions(idPos(y)).option('yes', { describe: 'Confirm deletion', type: 'boolean', alias: 'y' }), safe(deleteInvoiceHandler))
    .command('mark-sent <id>', 'Mark an invoice as sent', (y) => idPos(y), safe(markSentInvoiceHandler))
    .command('mark-void <id>', 'Void an invoice', (y) => idPos(y), safe(markVoidInvoiceHandler))
    .command(
      'email <id>',
      'Email an invoice to the customer',
      (y) =>
        localOptions(idPos(y))
          .option('to', { describe: 'Recipient emails (comma-separated); default: customer contacts', type: 'string' })
          .option('subject', { describe: 'Email subject', type: 'string' })
          .option('body', { describe: 'Email body', type: 'string' }),
      safe(emailInvoiceHandler),
    )
    .command('writeoff <id>', 'Write off the outstanding balance', (y) => idPos(y), safe(writeoffInvoiceHandler))
    .command('cancel-writeoff <id>', 'Cancel a write-off', (y) => idPos(y), safe(cancelWriteoffInvoiceHandler))
    .demandCommand(1, 'Specify an action: list, show, create, edit, delete, mark-sent, mark-void, email, writeoff, cancel-writeoff');
}
