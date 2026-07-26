import { addProfile, getProfile } from '../config-store.js';
import { exchangeGrantCode, DEFAULT_REGION } from '../../oauth.js';
import { refreshIdentity } from './_identity.js';

/**
 * Add or update a profile's Zoho Books OAuth credentials (upsert — only the
 * flags you pass are changed). For a brand-new profile you need client id +
 * secret and one of `--grant-code` (exchanged for a refresh token) or an
 * existing `--refresh-token`.
 */
export async function addConfigHandler(argv) {
  let existing = {};
  try {
    existing = getProfile(argv.name);
  } catch {
    /* new profile */
  }

  const fields = {};
  if (argv.region) fields.region = argv.region;
  if (argv.clientId) fields.client_id = argv.clientId;
  if (argv.clientSecret) fields.client_secret = argv.clientSecret;
  if (argv.organizationId) fields.organization_id = argv.organizationId;

  const region = fields.region || existing.region || DEFAULT_REGION;
  const clientId = fields.client_id || existing.client_id;
  const clientSecret = fields.client_secret || existing.client_secret;

  if (argv.grantCode) {
    if (!clientId || !clientSecret) {
      throw new Error('--client-id and --client-secret are required to exchange a --grant-code.');
    }
    const tok = await exchangeGrantCode({
      client_id: clientId,
      client_secret: clientSecret,
      code: argv.grantCode,
      region,
      redirect_uri: argv.redirectUri,
    });
    fields.refresh_token = tok.refresh_token;
    if (tok.access_token) {
      fields.access_token = tok.access_token;
      fields.access_token_expires_at = new Date(
        Date.now() + (Number(tok.expires_in) || 3600) * 1000,
      ).toISOString();
    }
    if (tok.api_domain) fields.api_domain = tok.api_domain;
    console.error('Exchanged grant code for a refresh token.');
  } else if (argv.refreshToken) {
    fields.refresh_token = argv.refreshToken;
  }

  const merged = { ...existing, ...fields };
  const missing = ['client_id', 'client_secret', 'refresh_token'].filter((k) => !merged[k]);
  if (missing.length) {
    throw new Error(
      `Profile '${argv.name}' is missing: ${missing.join(', ')}. ` +
        'Provide --client-id, --client-secret, and --grant-code (or --refresh-token).',
    );
  }

  addProfile(argv.name, fields);
  console.log(`Saved Zoho Books credentials for profile '${argv.name}'.`);

  // Best-effort self-describe. Never blocks the save.
  const resolved = await refreshIdentity(argv.name);
  if (resolved) {
    console.log(`Resolved organization for '${argv.name}'.`);
  } else if (!merged.organization_id) {
    console.error(
      'Could not auto-resolve organization_id (multiple or zero orgs, or a fetch error). ' +
        'Run `fob-zb organizations list`, then `fob-zb config profiles add ' +
        argv.name +
        ' --organization-id <id>`.',
    );
  }
}
