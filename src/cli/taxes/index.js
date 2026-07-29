import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listTaxesHandler } from './list.js';
import { showTaxHandler } from './show.js';

export function buildTaxesSubcommands(yargs) {
  return yargs
    .usage('$0 taxes <action> [options]')
    .command(
      'list',
      'List taxes',
      (y) => listOutputOptions(paginationOptions(y)),
      safe(listTaxesHandler),
    )
    .command(
      'show <id>',
      'Show a tax by id',
      (y) =>
        localOptions(y.positional('id', { describe: 'Tax id', type: 'string' }))
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showTaxHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
