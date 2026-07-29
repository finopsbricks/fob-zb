import { safe, paginationOptions, listOutputOptions, localOptions } from '../_helpers.js';
import { listVendorCreditsHandler } from './list.js';
import { showVendorCreditHandler } from './show.js';

export function buildVendorCreditsSubcommands(yargs) {
  return yargs
    .usage('$0 vendor-credits <action> [options]')
    .command(
      'list',
      'List vendor credits',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('status', { describe: 'Filter by status', type: 'string', choices: ['all', 'open', 'closed', 'void', 'draft'] })
          .option('vendor', { describe: 'Filter by vendor id', type: 'string' })
          .option('search', { describe: 'Free-text search', type: 'string' }),
      safe(listVendorCreditsHandler),
    )
    .command(
      'show <id>',
      'Show a vendor credit by id (with line items)',
      (y) =>
        localOptions(y.positional('id', { describe: 'Vendor credit id', type: 'string' }))
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showVendorCreditHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
