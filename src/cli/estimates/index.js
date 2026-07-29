import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listEstimatesHandler } from './list.js';
import { showEstimateHandler } from './show.js';
import { addDocumentWriteCommands } from '../utils/document-write.js';

export function buildEstimatesSubcommands(yargs) {
  yargs
    .usage('$0 estimates <action> [options]')
    .command(
      'list',
      'List estimates',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'draft', 'sent', 'invoiced', 'accepted', 'declined', 'expired'] })
          .option('customer', { describe: 'Filter by customer id', type: 'string' })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listEstimatesHandler),
    )
    .command(
      'show <id>',
      'Show an estimate by id (with line items)',
      (y) =>
        localOptions(y.positional('id', { describe: 'Estimate id', type: 'string' }))
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showEstimateHandler),
    );

  addDocumentWriteCommands(yargs, {
    namespace: 'estimates', label: 'estimate', idField: 'estimate_id', numberField: 'estimate_number',
    partyField: 'customer_id', partyArgKey: 'customer',
    statuses: [
      { verb: 'mark-sent', state: 'sent', desc: 'Mark as sent', msg: (id) => `Marked estimate ${id} as sent.` },
      { verb: 'mark-accepted', state: 'accepted', desc: 'Mark as accepted', msg: (id) => `Marked estimate ${id} as accepted.` },
      { verb: 'mark-declined', state: 'declined', desc: 'Mark as declined', msg: (id) => `Marked estimate ${id} as declined.` },
    ],
  });

  return yargs.demandCommand(1, 'Specify an action: list, show, create, edit, delete, mark-sent, mark-accepted, mark-declined, submit, approve, email');
}
