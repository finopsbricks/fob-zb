// @ts-check
/**
 * Zoho OAuth2 + data-center routing.
 *
 * PURE: every input comes from arguments — this module never reads process.env
 * or the CLI config file. The transport (http.js) and the CLI config layer call
 * these; workers can call them directly too.
 *
 * Zoho auth quirks this module encapsulates:
 *  - Each region is an independent tenant: the API host AND the accounts (OAuth)
 *    host must match or Zoho returns INVALID_TOKEN.
 *  - The token endpoint returns HTTP 200 with an `{ error }` body on failure, so
 *    a non-2xx check alone is not enough.
 *  - Access tokens live ~1 hour; refresh tokens do not expire until revoked.
 */

/** Region → { api host, accounts (OAuth) host }. */
export const REGIONS = {
  com: { api: 'https://www.zohoapis.com', accounts: 'https://accounts.zoho.com' },
  eu: { api: 'https://www.zohoapis.eu', accounts: 'https://accounts.zoho.eu' },
  in: { api: 'https://www.zohoapis.in', accounts: 'https://accounts.zoho.in' },
  'com.au': { api: 'https://www.zohoapis.com.au', accounts: 'https://accounts.zoho.com.au' },
  jp: { api: 'https://www.zohoapis.jp', accounts: 'https://accounts.zoho.jp' },
  ca: { api: 'https://www.zohoapis.ca', accounts: 'https://accounts.zohocloud.ca' },
  'com.cn': { api: 'https://www.zohoapis.com.cn', accounts: 'https://accounts.zoho.com.cn' },
  sa: { api: 'https://www.zohoapis.sa', accounts: 'https://accounts.zoho.sa' },
};

export const DEFAULT_REGION = 'com';

/** Zoho Books path prefix under the API host. */
export const BOOKS_BASE_PATH = '/books/v3';

export class OAuthError extends Error {
  /** @param {string} message @param {{ code?: string, status?: number }} [opts] */
  constructor(message, { code, status } = {}) {
    super(message);
    this.name = 'OAuthError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Resolve a region to its host pair, defaulting to `com`.
 * @param {string} [region]
 */
export function regionOf(region) {
  const r = REGIONS[region ?? DEFAULT_REGION];
  if (!r) {
    throw new OAuthError(
      `Unknown Zoho region '${region}'. Valid regions: ${Object.keys(REGIONS).join(', ')}.`,
      { code: 'UNKNOWN_REGION' },
    );
  }
  return r;
}

/**
 * API base host for a credential set — an explicit `api_domain` (cached from a
 * token response) wins over the region-derived host.
 * @param {{ region?: string, api_domain?: string }} credentials
 */
export function apiBase(credentials) {
  return credentials?.api_domain || regionOf(credentials?.region).api;
}

/**
 * Accounts (OAuth) server host for a credential set's region.
 * @param {{ region?: string }} credentials
 */
export function accountsBase(credentials) {
  return regionOf(credentials?.region).accounts;
}

/**
 * POST to the region's token endpoint. Treats a 200 with an `{ error }` body as
 * a failure (Zoho's convention).
 * @param {string} accountsUrl
 * @param {Record<string, string>} params
 */
async function tokenRequest(accountsUrl, params) {
  const url = new URL('/oauth/v2/token', accountsUrl);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
    },
    body: new URLSearchParams(params),
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new OAuthError(`Invalid token response (status ${res.status}): ${text.slice(0, 200)}`, {
        code: 'INVALID_RESPONSE',
        status: res.status,
      });
    }
  }

  if (!res.ok || data?.error) {
    throw new OAuthError(zohoTokenErrorMessage(data?.error) , {
      code: data?.error || 'TOKEN_ERROR',
      status: res.status,
    });
  }
  return data;
}

/** Map Zoho's terse token error codes to actionable messages. */
function zohoTokenErrorMessage(error) {
  switch (error) {
    case 'invalid_code':
      return 'Grant code is invalid or already used (they are single-use and short-lived). Generate a fresh one.';
    case 'invalid_client':
      return 'client_id / client_secret is invalid, or does not match this data center (region).';
    case 'invalid_grant':
      return 'Refresh token is invalid or has been revoked. Re-run the consent flow.';
    default:
      return error ? `Zoho token error: ${error}` : 'Zoho token request failed.';
  }
}

/**
 * Exchange a one-time grant code (self-client or authorization-code flow) for a
 * refresh token + first access token.
 * @param {{ client_id: string, client_secret: string, code: string, region?: string, redirect_uri?: string }} args
 * @returns {Promise<{ refresh_token: string, access_token: string, api_domain?: string, expires_in?: number }>}
 */
export async function exchangeGrantCode({ client_id, client_secret, code, region, redirect_uri }) {
  const params = { grant_type: 'authorization_code', client_id, client_secret, code };
  // Self-client codes need no redirect_uri; web auth-code flows require it.
  if (redirect_uri) params.redirect_uri = redirect_uri;
  const data = await tokenRequest(accountsBase({ region }), params);
  if (!data?.refresh_token) {
    throw new OAuthError(
      'Token exchange succeeded but returned no refresh_token. Ensure the grant was created with offline access (access_type=offline).',
      { code: 'NO_REFRESH_TOKEN' },
    );
  }
  return {
    refresh_token: data.refresh_token,
    access_token: data.access_token,
    api_domain: data.api_domain,
    expires_in: data.expires_in,
  };
}

/**
 * Exchange a refresh token for a fresh access token.
 * @param {{ client_id: string, client_secret: string, refresh_token: string, region?: string }} args
 * @returns {Promise<{ access_token: string, api_domain?: string, expires_in?: number }>}
 */
export async function refreshAccessToken({ client_id, client_secret, refresh_token, region }) {
  const data = await tokenRequest(accountsBase({ region }), {
    grant_type: 'refresh_token',
    client_id,
    client_secret,
    refresh_token,
  });
  return {
    access_token: data.access_token,
    api_domain: data.api_domain,
    expires_in: data.expires_in,
  };
}

/**
 * Revoke a refresh token at the region's accounts server.
 * @param {{ token: string, region?: string }} args
 */
export async function revokeRefreshToken({ token, region }) {
  const url = new URL('/oauth/v2/token/revoke', accountsBase({ region }));
  url.searchParams.set('token', token);
  const res = await fetch(url, { method: 'POST', headers: { accept: 'application/json' } });
  if (!res.ok) {
    throw new OAuthError(`Failed to revoke token (status ${res.status}).`, {
      code: 'REVOKE_FAILED',
      status: res.status,
    });
  }
  return true;
}
