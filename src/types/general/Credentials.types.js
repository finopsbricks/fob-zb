// @ts-check
/**
 * Credentials for the Zoho Books client (OAuth2, Auth Pattern B).
 *
 * `fobZb(credentials)` binds these once. Workers pass them from their own env;
 * the CLI resolves them from ~/.fob/fob-zb/config.yml. The transport refreshes
 * the access token on demand from the refresh token — callers never mint tokens.
 *
 * @typedef {Object} ZbCredentials
 * @property {string} client_id                    OAuth client id
 * @property {string} client_secret                OAuth client secret
 * @property {string} refresh_token                Long-lived refresh token (minted once via consent)
 * @property {string} organization_id              Zoho tenant id; injected as `organization_id` on every call
 * @property {string} [region]                     'com'|'eu'|'in'|'com.au'|'jp'|'ca'|'com.cn'|'sa' (default 'com')
 * @property {string} [api_domain]                 Cached API host from the token response; overrides region-derived host
 * @property {string} [access_token]               Cached access token (auto-refreshed)
 * @property {string} [access_token_expires_at]    ISO timestamp; refresh when now >= this minus a skew window
 * @property {(tokens: PersistedTokens) => void} [persistToken]  Called after a refresh so the caller can persist the new token (CLI writes config; workers omit)
 */

/**
 * @typedef {Object} PersistedTokens
 * @property {string} access_token
 * @property {string} access_token_expires_at
 * @property {string} [api_domain]
 */

export {};
