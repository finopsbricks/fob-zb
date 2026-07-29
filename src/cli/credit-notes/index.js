import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listCreditNotesHandler } from './list.js';
import { showCreditNoteHandler } from './show.js';
import { addDocumentWriteCommands } from '../utils/document-write.js';

export function buildCreditNotesSubcommands(yargs) {
  yargs
    .usage('$0 credit-notes <action> [options]')
    .command(
      'list',
      'List credit notes',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'open', 'closed', 'void', 'draft'] })
          .option('customer', { describe: 'Filter by customer id', type: 'string' })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listCreditNotesHandler),
    )
    .command(
      'show <id>',
      'Show a credit note by id (with line items)',
      (y) =>
        localOptions(y.positional('id', { describe: 'Credit note id', type: 'string' }))
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showCreditNoteHandler),
    );

  addDocumentWriteCommands(yargs, {
    namespace: 'creditNotes', label: 'credit note', idField: 'creditnote_id', numberField: 'creditnote_number',
    partyField: 'customer_id', partyArgKey: 'customer',
    statuses: [
      { verb: 'mark-open', state: 'open', desc: 'Mark as open', msg: (id) => `Marked credit note ${id} as open.` },
      { verb: 'mark-void', state: 'void', desc: 'Void the credit note', msg: (id) => `Voided credit note ${id}.` },
    ],
  });

  return yargs.demandCommand(1, 'Specify an action: list, show, create, edit, delete, mark-open, mark-void, submit, approve, email');
}
