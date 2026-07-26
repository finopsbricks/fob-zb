/**
 * `fob-zb auth <action>` — OAuth token operations on the active profile.
 *
 * `auth` is a namespace (like `config`), not a data resource: it manages the
 * token lifecycle rather than Zoho records. The one-time consent that mints a
 * refresh token is done via `config profiles add --grant-code` today; a browser
 * loopback `auth login` lands in a later phase.
 */

import { safe } from '../_helpers.js';
import { authStatusHandler } from './status.js';
import { authRefreshHandler } from './refresh.js';
import { authLogoutHandler } from './logout.js';

export function buildAuthSubcommands(yargs) {
  return yargs
    .usage('$0 auth <action> [options]')
    .command(
      'status',
      'Show the active identity and access-token freshness',
      (y) => y.option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(authStatusHandler),
    )
    .command(
      'refresh',
      'Force an access-token refresh now',
      (y) => y.option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(authRefreshHandler),
    )
    .command(
      'logout',
      'Revoke the refresh token at Zoho and clear cached tokens locally',
      (y) => y.option('local', { describe: 'Clear locally only; do not revoke at Zoho', type: 'boolean' }),
      safe(authLogoutHandler),
    )
    .demandCommand(1, 'Specify an action: status, refresh, logout');
}
