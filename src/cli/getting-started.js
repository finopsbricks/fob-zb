/**
 * `fob-zb getting-started` — an in-band setup walkthrough for people and for
 * LLM agents driving the CLI on a user's behalf.
 *
 * It first checks for configured profiles: if one already exists, setup is done
 * and the command says so (naming the current profile) rather than walking the
 * agent through credentials it already has. Only when nothing is configured does
 * it print the full Self Client → grant code → profile walkthrough.
 */

import { listProfiles } from './config-store.js';
import { REGIONS, DEFAULT_REGION, apiConsoleUrl } from '../oauth.js';
import { CREDENTIALS_DOCS_URL, DOCS_URL } from '../links.js';

function alreadyConfigured({ current, profiles, path }) {
  const names = profiles
    .map((p) => (p.organization_name ? `${p.name} (${p.organization_name})` : p.name))
    .join(', ');
  const lines = [
    'Setup is already complete — no need to run through getting started.',
    '',
    `Configured profile(s): ${names}`,
    current ? `Active profile:        ${current}` : 'Active profile:        (none selected)',
    `Config file:           ${path}`,
    '',
    'You can start running commands now, for example:',
    '',
    '  fob-zb config profiles current        # confirm the active org',
    '  fob-zb invoices list --status overdue',
    '  fob-zb contacts list --type customer',
    '',
    'To add another Zoho Books organization the same Zoho login can see, reuse',
    "an existing profile's credentials — no new Self Client needed:",
    '',
    '  fob-zb organizations list             # find the organization_id',
    '  fob-zb config profiles add <name> --from <existing-profile> --organization-id <id>',
    '',
    `Docs: ${DOCS_URL}`,
  ];
  return lines.join('\n');
}

function notConfigured() {
  const consoles = Object.keys(REGIONS)
    .map((r) => `     ${r.padEnd(7)} ${apiConsoleUrl(r)}`)
    .join('\n');
  const lines = [
    'No profile is configured yet. Follow these steps to connect Zoho Books.',
    '',
    'Note for automated agents: always check for an existing profile first with',
    '`fob-zb config profiles current`. If one is configured, setup is complete —',
    'skip the steps below and start running commands. Never invent credentials;',
    'ask the user for the client id, client secret and grant code.',
    '',
    '1. Open the Zoho API Console for the data center your Zoho Books account is in.',
    '   A client only works in the region it was created in.',
    '',
    consoles,
    '',
    '2. Choose Get Started (or Add Client) → Self Client → Create.',
    '   The Client Secret tab shows the Client ID (1000.…) and Client Secret.',
    '',
    '3. On the Generate Code tab enter:',
    '     Scope:          ZohoBooks.fullaccess.all',
    '     Time duration:  10 minutes',
    '     Description:    anything, e.g. fob-zb',
    '   Choose Create, pick your Zoho Books organization, and copy the code.',
    '',
    '4. Add a profile before the code expires (codes are single-use):',
    '',
    '   fob-zb config profiles add myorg \\',
    `     --region ${DEFAULT_REGION} \\`,
    '     --client-id 1000.XXXXXXXX \\',
    '     --client-secret yyyyyyyy \\',
    '     --grant-code 1000.zzzzzzzz',
    '',
    '5. Confirm it works:',
    '',
    '   fob-zb config profiles current',
    '   fob-zb organizations list',
    '',
    `Step-by-step guide with screenshots: ${CREDENTIALS_DOCS_URL}`,
  ];
  return lines.join('\n');
}

export async function gettingStartedHandler() {
  const info = listProfiles();
  console.log(info.profiles.length > 0 ? alreadyConfigured(info) : notConfigured());
}
