import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listUsersHandler } from './list.js';
import { showUserHandler } from './show.js';

export function buildUsersSubcommands(yargs) {
  return yargs
    .usage('$0 users <action> [options]')
    .command(
      'list',
      'List users',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'active', 'inactive', 'invited'] }),
      safe(listUsersHandler),
    )
    .command(
      'show <id>',
      'Show a user by id',
      (y) =>
        localOptions(y.positional('id', { describe: 'User id', type: 'string' }))
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showUserHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
