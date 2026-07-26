import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listCurrenciesHandler } from './list.js';
import { showCurrencyHandler } from './show.js';

export function buildCurrenciesSubcommands(yargs) {
  return yargs
    .usage('$0 currencies <action> [options]')
    .command(
      'list',
      'List currencies',
      (y) => listOutputOptions(paginationOptions(y)),
      safe(listCurrenciesHandler),
    )
    .command(
      'show <id>',
      'Show a currency by id',
      (y) =>
        y
          .positional('id', { describe: 'Currency id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showCurrencyHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
