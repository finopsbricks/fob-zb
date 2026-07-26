import { requireCreds } from '../_helpers.js';
import { updateProfileTokens } from '../config-store.js';
import { refreshAccessToken } from '../../oauth.js';

/** Force an access-token refresh now (persists to the profile when there is one). */
export async function authRefreshHandler(argv) {
  const creds = requireCreds();
  const tok = await refreshAccessToken(creds);
  const expiresAt = new Date(Date.now() + (Number(tok.expires_in) || 3600) * 1000).toISOString();

  if (creds.name) {
    updateProfileTokens(creds.name, {
      access_token: tok.access_token,
      access_token_expires_at: expiresAt,
      api_domain: tok.api_domain,
    });
  }

  if (argv.json) {
    console.log(JSON.stringify({ refreshed: true, access_token_expires_at: expiresAt }, null, 2));
    return;
  }
  console.log(
    `Access token refreshed${creds.name ? ` for profile '${creds.name}'` : ''} — valid until ${expiresAt}.`,
  );
}
