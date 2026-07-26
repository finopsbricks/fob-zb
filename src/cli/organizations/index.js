/**
 * Subtree builder for `fob-zb organizations <action>`.
 *
 * `organizations list` needs no organization_id, so it's the bootstrap command
 * used to discover the id every other resource requires.
 */

import { safe } from '../_helpers.js';
import { listOrganizationsHandler } from './list.js';
import { showOrganizationHandler } from './show.js';

export function buildOrganizationsSubcommands(yargs) {
  return yargs
    .usage('$0 organizations <action> [options]')
    .command(
      'list',
      'List organizations (tenants) this login can access',
      (y) =>
        y
          .option('fields', { describe: 'Columns to show, comma-separated', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(listOrganizationsHandler),
    )
    .command(
      'show <id>',
      'Show an organization by id',
      (y) =>
        y
          .positional('id', { describe: 'Organization id', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(showOrganizationHandler),
    )
    .demandCommand(1, 'Specify an action: list, show');
}
