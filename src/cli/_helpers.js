/**
 * Shared yargs helpers.
 */

import { resolveCredentials, updateProfileTokens } from './config-store.js';
import { fobZb } from '../index.js';

/**
 * Wrap a handler so unexpected exceptions exit cleanly without a stack trace.
 * Set FOB_DEBUG=1 to see the full stack.
 */
export function safe(handler) {
  return async (argv) => {
    try {
      await handler(argv);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      if (process.env.FOB_DEBUG) console.error(err.stack);
      process.exit(1);
    }
  };
}

/** Standard pagination + JSON output options for list commands (Zoho: page/per_page). */
export function paginationOptions(yargs) {
  return yargs
    .option('page', { describe: 'Page number', type: 'number', default: 1 })
    .option('per-page', { describe: 'Page size (max 200)', type: 'number', default: 200 })
    .option('json', { describe: 'Output raw JSON', type: 'boolean' });
}

/** Column-selection + format/output options shared by every `list` command. */
export function listOutputOptions(yargs) {
  return yargs
    .option('fields', { describe: 'Columns to show, comma-separated', type: 'string' })
    .option('format', {
      describe: 'Output format. csv/json auto-paginate the full result set',
      type: 'string',
      choices: ['table', 'csv', 'json'],
    })
    .option('output', { describe: 'Write output to a file instead of stdout', type: 'string' });
}

// Print the credential-source hint at most once per invocation.
let hintPrinted = false;

/**
 * Resolve the current command's credentials, printing a one-time hint to stderr
 * about which identity is in use.
 */
export function requireCreds() {
  const creds = resolveCredentials();
  if (!hintPrinted) {
    console.error(`(using Zoho Books credentials from ${creds.source})`);
    hintPrinted = true;
  }
  return creds;
}

/**
 * Build a credential-bound `fobZb` client for the current command — the same
 * client workers construct, so a handler exercises the exact library path.
 *
 * When the credentials come from a config profile, wire the `persistToken` seam
 * so a refreshed access token is written back to that profile (workers using env
 * creds have no profile and refresh in-memory only).
 */
export function clientFor() {
  const creds = requireCreds();
  const persistToken = creds.name ? (tokens) => updateProfileTokens(creds.name, tokens) : undefined;
  return fobZb({ ...creds, persistToken });
}
