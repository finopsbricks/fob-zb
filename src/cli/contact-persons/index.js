import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listContactPersonsHandler } from './list.js';
import { showContactPersonHandler } from './show.js';

export function buildContactPersonsSubcommands(yargs) {
  return yargs
    .usage('$0 contact-persons <action> [options]')
    .command(
      'list',
      'List contact persons',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('contact', { describe: 'Filter by contact id', type: 'string' }),
      safe(listContactPersonsHandler),
    )
    .command(
      'show <id>',
      'Show a contact person by id',
      (y) =>
        localOptions(y.positional('id', { describe: 'Contact person id', type: 'string' }))
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showContactPersonHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
