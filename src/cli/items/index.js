import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listItemsHandler } from './list.js';
import { showItemHandler } from './show.js';

export function buildItemsSubcommands(yargs) {
  return yargs
    .usage('$0 items <action> [options]')
    .command(
      'list',
      'List items (products & services)',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'active', 'inactive'] })
          .option('search', { describe: 'Free-text search (name, sku)', type: 'string' }),
      safe(listItemsHandler),
    )
    .command(
      'show <id>',
      'Show an item by id',
      (y) =>
        y
          .positional('id', { describe: 'Item id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showItemHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
