/**
 * Subtree builder for `fob-zb contacts <action>`.
 */

import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listContactsHandler } from './list.js';
import { showContactHandler } from './show.js';
import { createContactHandler } from './create.js';
import { editContactHandler } from './edit.js';
import { deleteContactHandler } from './delete.js';
import { activateContactHandler, deactivateContactHandler } from './status.js';
import { contactFieldOptions } from './_body.js';

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
        localOptions(y.positional('id', { describe: 'Contact id', type: 'string' }))
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showContactHandler),
    )
    .command(
      'create',
      'Create a contact',
      (y) => contactFieldOptions(y).option('name', { describe: 'Contact name', type: 'string', demandOption: true }),
      safe(createContactHandler),
    )
    .command(
      'edit <id>',
      'Update a contact (only passed flags change)',
      (y) =>
        contactFieldOptions(y.positional('id', { describe: 'Contact id', type: 'string' }))
          .option('name', { describe: 'Contact name', type: 'string' }),
      safe(editContactHandler),
    )
    .command(
      'delete <id>',
      'Delete a contact (requires --yes)',
      (y) =>
        localOptions(y.positional('id', { describe: 'Contact id', type: 'string' }))
          .option('yes', { describe: 'Confirm deletion', type: 'boolean', alias: 'y' }),
      safe(deleteContactHandler),
    )
    .command(
      'activate <id>',
      'Mark a contact active',
      (y) => y.positional('id', { describe: 'Contact id', type: 'string' }),
      safe(activateContactHandler),
    )
    .command(
      'deactivate <id>',
      'Mark a contact inactive',
      (y) => y.positional('id', { describe: 'Contact id', type: 'string' }),
      safe(deactivateContactHandler),
    )
    .demandCommand(1, 'Specify an action: list, show, create, edit, delete, activate, deactivate');
}
