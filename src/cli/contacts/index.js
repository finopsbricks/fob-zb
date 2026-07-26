/**
 * Subtree builder for `fob-zb contacts <action>`. Read actions for now.
 */

import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listContactsHandler } from './list.js';
import { showContactHandler } from './show.js';

export function buildContactsSubcommands(yargs) {
  return yargs
    .usage('$0 contacts <action> [options]')
    .command(
      'list',
      'List contacts (customers & vendors)',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('type', { describe: 'Filter by contact type (mutually exclusive with --status)', type: 'string', choices: ['customer', 'vendor'] })
          .option('status', { describe: 'Filter by status (mutually exclusive with --type)', type: 'string', choices: ['all', 'active', 'inactive'] })
          .option('search', { describe: 'Free-text search (name, company, email, phone)', type: 'string' }),
      safe(listContactsHandler),
    )
    .command(
      'show <id>',
      'Show a contact by id',
      (y) =>
        y
          .positional('id', { describe: 'Contact id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showContactHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
