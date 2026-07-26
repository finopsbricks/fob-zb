import { resolveCredentials, clearProfileTokens } from '../config-store.js';
import { revokeRefreshToken } from '../../oauth.js';

/**
 * Revoke the profile's refresh token at Zoho and clear cached tokens locally.
 * Only operates on config profiles (env-based credentials have no stored state).
 */
export async function authLogoutHandler(argv) {
  const creds = resolveCredentials();
  if (!creds.name) {
    throw new Error('`auth logout` operates on a config profile; env-based credentials have none to clear.');
  }

  if (creds.refresh_token && !argv.local) {
    try {
      await revokeRefreshToken({ token: creds.refresh_token, region: creds.region });
      console.error('Revoked refresh token at Zoho.');
    } catch (err) {
      console.error(`Warning: could not revoke at Zoho (${err.message}). Clearing locally anyway.`);
    }
  }

  clearProfileTokens(creds.name);
  console.log(
    `Cleared tokens for profile '${creds.name}'. Re-add with a fresh grant code to use it again.`,
  );
}
