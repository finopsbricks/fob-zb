import { safe, localOptions } from '../_helpers.js';
import { addConfigHandler } from './add.js';
import { listConfigHandler } from './list.js';
import { useConfigHandler } from './use.js';
import { removeConfigHandler } from './remove.js';
import { currentConfigHandler } from './current.js';
import { refreshConfigHandler } from './refresh.js';
import { REGIONS } from '../../oauth.js';

/**
 * The multi-tenant object is a "profile" — a named Zoho OAuth credential set. A
 * profile maps 1:1 to a Zoho organization, so `orgs` is offered as an alias.
 * `config` is a namespace, not the object: `fob-zb config profiles <action>`.
 */
function buildProfilesSubcommands(yargs) {
  return yargs
    .usage('$0 config profiles <action> [options]')
    .command(
      'list',
      'List profiles (current marked with *)',
      (y) => localOptions(y).option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(listConfigHandler),
    )
    .command(
      ['current', 'whoami'],
      'Show the active profile + resolution source',
      (y) => localOptions(y).option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(currentConfigHandler),
    )
    .command(
      'add <name>',
      "Add or update a profile's Zoho Books OAuth credentials (upsert)",
      (y) =>
        localOptions(y.positional('name', { describe: 'Profile name', type: 'string' }))
          .option('region', {
            describe: 'Zoho data center',
            type: 'string',
            choices: Object.keys(REGIONS),
          })
          .option('client-id', { describe: 'OAuth client id', type: 'string' })
          .option('client-secret', { describe: 'OAuth client secret', type: 'string' })
          .option('grant-code', {
            describe: 'One-time self-client grant code (exchanged for a refresh token)',
            type: 'string',
          })
          .option('refresh-token', {
            describe: 'An existing refresh token (alternative to --grant-code)',
            type: 'string',
          })
          .option('organization-id', { describe: 'Zoho organization (tenant) id', type: 'string' })
          .option('from', {
            describe: "Reuse another profile's OAuth credentials (add a second org without a new Self Client)",
            type: 'string',
          })
          .option('redirect-uri', {
            describe: 'Redirect URI (only for web auth-code grants, not self-client)',
            type: 'string',
          }),
      safe(addConfigHandler),
    )
    .command(
      'use <name>',
      'Set the current profile',
      (y) => y.positional('name', { describe: 'Profile name', type: 'string' }),
      safe(useConfigHandler),
    )
    .command(
      ['remove <name>', 'rm <name>'],
      'Remove a profile',
      (y) => y.positional('name', { describe: 'Profile name', type: 'string' }),
      safe(removeConfigHandler),
    )
    .command(
      'refresh [name]',
      "Refresh a profile's org identity from the server (--all for every profile)",
      (y) =>
        localOptions(y.positional('name', { describe: 'Profile name (omit with --all)', type: 'string' }))
          .option('all', { describe: 'Refresh every profile', type: 'boolean' }),
      safe(refreshConfigHandler),
    )
    .demandCommand(1, 'Specify an action: list, current, add, use, remove, refresh');
}

export function buildConfigSubcommands(yargs) {
  return yargs
    .usage('$0 config <resource> <action> [options]')
    .command(['profiles', 'orgs'], 'Manage credential profiles (alias: orgs)', buildProfilesSubcommands)
    .demandCommand(1, 'Specify a resource: profiles (alias: orgs)');
}
