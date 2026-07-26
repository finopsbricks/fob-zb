import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listItemsHandler } from './list.js';
import { showItemHandler } from './show.js';
import { itemFieldOptions, buildItemBody } from './_body.js';
import { makeWriteHandlers } from '../utils/write-commands.js';

const w = makeWriteHandlers({ namespace: 'items', label: 'item', idField: 'item_id', buildBody: buildItemBody });

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
      (y) => y.positional('id', { describe: 'Item id', type: 'string' }).option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showItemHandler),
    )
    .command(
      'create',
      'Create an item',
      (y) =>
        itemFieldOptions(y)
          .option('name', { describe: 'Item name', type: 'string', demandOption: true })
          .option('rate', { describe: 'Sales rate', type: 'number', demandOption: true }),
      safe(w.create),
    )
    .command(
      'edit <id>',
      'Update an item (only passed flags change)',
      (y) => itemFieldOptions(y).positional('id', { describe: 'Item id', type: 'string' }).option('name', { describe: 'Item name', type: 'string' }),
      safe(w.edit),
    )
    .command(
      'delete <id>',
      'Delete an item (requires --yes)',
      (y) => y.positional('id', { describe: 'Item id', type: 'string' }).option('yes', { describe: 'Confirm deletion', type: 'boolean', alias: 'y' }),
      safe(w.remove),
    )
    .command('activate <id>', 'Mark an item active', (y) => y.positional('id', { describe: 'Item id', type: 'string' }), safe(w.activate))
    .command('deactivate <id>', 'Mark an item inactive', (y) => y.positional('id', { describe: 'Item id', type: 'string' }), safe(w.deactivate))
    .demandCommand(1, 'Specify an action: list, show, create, edit, delete, activate, deactivate');
}
