import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listProjectsHandler } from './list.js';
import { showProjectHandler } from './show.js';

export function buildProjectsSubcommands(yargs) {
  return yargs
    .usage('$0 projects <action> [options]')
    .command(
      'list',
      'List projects',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'active', 'inactive'] })
          .option('customer', { describe: 'Filter by customer id', type: 'string' }),
      safe(listProjectsHandler),
    )
    .command(
      'show <id>',
      'Show a project by id',
      (y) =>
        localOptions(y.positional('id', { describe: 'Project id', type: 'string' }))
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showProjectHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
