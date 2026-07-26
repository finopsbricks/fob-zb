import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listBillsHandler } from './list.js';
import { showBillHandler } from './show.js';
import { billFieldOptions } from './_body.js';
import {
  createBillHandler,
  editBillHandler,
  deleteBillHandler,
  markOpenBillHandler,
  markVoidBillHandler,
} from './write.js';

const idPos = (y) => y.positional('id', { describe: 'Bill id', type: 'string' });

export function buildBillsSubcommands(yargs) {
  return yargs
    .usage('$0 bills <action> [options]')
    .command(
      'list',
      'List bills (vendor payables)',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'draft', 'open', 'overdue', 'paid', 'partially_paid', 'void'] })
          .option('vendor', { describe: 'Filter by vendor id', type: 'string' })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listBillsHandler),
    )
    .command(
      'show <id>',
      'Show a bill by id (with line items)',
      (y) => idPos(y).option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showBillHandler),
    )
    .command(
      'create',
      'Create a bill',
      (y) => billFieldOptions(y).option('vendor', { describe: 'Vendor id', type: 'string', demandOption: true }),
      safe(createBillHandler),
    )
    .command(
      'edit <id>',
      'Update a bill (only passed flags change)',
      (y) => billFieldOptions(idPos(y)).option('vendor', { describe: 'Vendor id', type: 'string' }),
      safe(editBillHandler),
    )
    .command('delete <id>', 'Delete a bill (requires --yes)', (y) => idPos(y).option('yes', { describe: 'Confirm deletion', type: 'boolean', alias: 'y' }), safe(deleteBillHandler))
    .command('mark-open <id>', 'Mark a bill as open', (y) => idPos(y), safe(markOpenBillHandler))
    .command('mark-void <id>', 'Void a bill', (y) => idPos(y), safe(markVoidBillHandler))
    .demandCommand(1, 'Specify an action: list, show, create, edit, delete, mark-open, mark-void');
}
