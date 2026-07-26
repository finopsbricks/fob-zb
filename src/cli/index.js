/**
 * CLI entry point:
 *
 *   fob-zb <resource> <action> [target] [options]
 *
 * A Zoho Books wrapper. Credentials come from ~/.fob/fob-zb/config.yml (managed
 * by `config`) or FOB_ZB_* env; OAuth token refresh is handled by the client.
 * `--profile <name>` overrides the active profile for one command.
 */

import yargs from 'yargs';

import { setProfileOverride } from './config-store.js';
import { buildConfigSubcommands } from './config/index.js';
import { buildAuthSubcommands } from './auth/index.js';
import { buildOrganizationsSubcommands } from './organizations/index.js';
import { buildContactsSubcommands } from './contacts/index.js';

export function run(argv) {
  return yargs(argv)
    .scriptName('fob-zb')
    .usage('$0 <resource> <action> [target] [options]')
    .option('profile', {
      alias: 'org',
      describe: 'Use credentials from a specific configured profile (overrides current + env)',
      type: 'string',
    })
    .middleware((argv) => {
      if (argv.profile) setProfileOverride(argv.profile);
    })
    .command('config <resource>', 'Manage credential profiles (alias: orgs)', buildConfigSubcommands)
    .command('auth <action>', 'OAuth token operations (status, refresh, logout)', buildAuthSubcommands)
    .command('organizations <action>', 'List/show Zoho organizations (tenants)', buildOrganizationsSubcommands)
    .command('contacts <action>', 'List/show contacts (customers & vendors)', buildContactsSubcommands)
    .demandCommand(1, 'Specify a resource. Try `fob-zb --help`.')
    .strict()
    .help()
    .alias('h', 'help')
    .version()
    .alias('v', 'version')
    .parse();
}
