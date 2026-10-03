// @ts-check
/**
 * Zoho Books API transport (OAuth2, Auth Pattern B).
 *
 * PURE with respect to configuration: credentials come from the `credentials`
 * argument only — never process.env or the config file. What makes this transport
 * different from the api-key siblings (fob-stm, fob-email):
 *
 *  - It owns the OAuth access-token lifecycle. `createTransport` holds a per-client
 *    in-memory token cache seeded from the credentials, refreshes it from the
 *    refresh token when missing/expiring, and (optionally) calls
 *    `credentials.persistToken` so the CLI can write the new token back to config.
 *  - It sends `Authorization: Zoho-oauthtoken <token>` (NOT `Bearer`).
 *  - It injects `organization_id` on every request.
 *  - It unwraps Zoho's `{ code, message, <resource> }` envelope: `code !== 0` is an
 *    application error even on HTTP 200.
 *  - It routes to the region's API host (or the cached `api_domain`) under /books/v3.
 *
 * @typedef {import('./types/general/index.js').ZbCredentials} Credentials
 * @typedef {import('./types/general/index.js').Transport} Transport
 */

import { apiBase, refreshAccessToken, BOOKS_BASE_PATH } from './oauth.js';

/** Row ceiling for auto-paginated fetches (`ctx.getAll`). */
export const MAX_ALL_ROWS = 15000;

/** Zoho's max page size. */
export const MAX_PAGE_SIZE = 200;

/** Refresh the access token this many ms before its stated expiry. */
const EXPIRY_SKEW_MS = 60_000;

/** Max retries on HTTP 429 (rate limit). */
const RATE_LIMIT_RETRIES = 3;

export class ApiError extends Error {
  /** @param {string} message @param {{ code?: string|number, status?: number }} [opts] */
  constructor(message, { code, status } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Validate the OAuth credential set needed to mint an access token. Note this
 * does NOT require `organization_id` — token refresh doesn't need it, and the
 * bootstrap call `organizations list` (which discovers the org id) has no org id
 * yet. `organization_id` is injected per-request only when present; Zoho rejects
 * the calls that actually need it.
 * @param {Credentials} credentials
 */
function requireOAuthCreds(credentials) {
  const missing = ['client_id', 'client_secret', 'refresh_token'].filter(
    (k) => !credentials?.[k],
  );
  if (missing.length) {
    throw new ApiError(
      `Missing Zoho Books credentials: ${missing.join(', ')}. Pass them to fobZb() ` +
        '(client_id, client_secret, refresh_token).',
      { code: 'NO_CREDENTIALS' },
    );
  }
  return credentials;
}

/**
 * Build a fully-resolved Zoho Books URL under {api_base}/books/v3, dropping
 * undefined/null/'' query params.
 * @param {string} apiDomain
 * @param {string} path
 * @param {Record<string, any>} [searchParams]
 */
function buildUrl(apiDomain, path, searchParams) {
  const base = apiDomain.replace(/\/+$/, '');
  const url = new URL(`${base}${BOOKS_BASE_PATH}/${path.replace(/^\//, '')}`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url;
}

/** First array value in the envelope — fallback when a resource key isn't given. */
function firstArray(body) {
  if (!body || typeof body !== 'object') return [];
  for (const v of Object.values(body)) if (Array.isArray(v)) return v;
  return [];
}

/**
 * One file as a multipart/form-data body (Node 18+ built-ins, no dependency).
 * @param {import('./types/general/Transport.types.js').UploadFile} file
 */
function toFormData({ field, filename, data, contentType = 'application/octet-stream' }) {
  const form = new FormData();
  form.append(field, new Blob([/** @type {BlobPart} */ (data)], { type: contentType }), filename);
  return form;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Bind credentials once and return a transport whose methods carry no
 * `credentials` argument. This is the seam the resource layer builds on:
 * `fobZb(credentials)` calls this, then hands the `ctx` to each `buildX(ctx)`.
 *
 * The token cache lives in this closure, so one client reused across many calls
 * refreshes at most once per hour.
 *
 * @param {Credentials} [credentials]
 * @returns {Transport}
 */
export function createTransport(credentials) {
  // In-memory token cache, seeded from the (possibly persisted) credentials.
  let accessToken = credentials?.access_token || null;
  let expiresAt = credentials?.access_token_expires_at
    ? Date.parse(credentials.access_token_expires_at)
    : 0;
  // api_domain may be updated by a token response (auto-detect the DC).
  let apiDomain = credentials?.api_domain || null;

  async function ensureToken(force = false) {
    const now = Date.now();
    if (!force && accessToken && Number.isFinite(expiresAt) && now < expiresAt - EXPIRY_SKEW_MS) {
      return accessToken;
    }
    const creds = requireOAuthCreds(credentials);
    const data = await refreshAccessToken(creds);
    accessToken = data.access_token;
    expiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;
    if (data.api_domain) apiDomain = data.api_domain;

    if (typeof credentials?.persistToken === 'function') {
      credentials.persistToken({
        access_token: accessToken,
        access_token_expires_at: new Date(expiresAt).toISOString(),
        api_domain: apiDomain || undefined,
      });
    }
    return accessToken;
  }

  function resolvedBase() {
    return apiDomain || apiBase(credentials);
  }

  /**
   * @param {string} method
   * @param {string} path
   * @param {any} [body]
   * @param {{ searchParams?: Record<string, any> }} [options]
   */
  async function request(method, path, body, { searchParams } = {}, _tokenRetried = false) {
    const token = await ensureToken();
    const url = buildUrl(resolvedBase(), path, {
      organization_id: credentials?.organization_id,
      ...searchParams,
    });

    const headers = {
      authorization: `Zoho-oauthtoken ${token}`,
      accept: 'application/json',
    };
    const init = { method, headers };
    if (body instanceof FormData) {
      // fetch sets the multipart content-type (with boundary) itself.
      init.body = body;
    } else if (body !== undefined) {
      headers['content-type'] = 'application/json';
      init.body = JSON.stringify(body);
    }

    let res;
    for (let attempt = 0; ; attempt++) {
      res = await fetch(url, init);
      if (res.status === 429 && attempt < RATE_LIMIT_RETRIES) {
        const retryAfter = Number(res.headers.get('retry-after')) || 2 ** attempt;
        await sleep(retryAfter * 1000);
        continue;
      }
      break;
    }

    // Expired/invalid token → force one refresh and retry the request once.
    if (res.status === 401 && !_tokenRetried) {
      await ensureToken(true);
      return request(method, path, body, { searchParams }, true);
    }

    return handleResponse(res);
  }

  async function handleResponse(res) {
    const text = await res.text();
    let body = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        throw new ApiError(`Invalid JSON response (status ${res.status}): ${text.slice(0, 200)}`, {
          code: 'INVALID_RESPONSE',
          status: res.status,
        });
      }
    }

    if (!res.ok) {
      throw new ApiError(body?.message || `${res.status} ${res.statusText}`, {
        code: body?.code ?? 'HTTP_ERROR',
        status: res.status,
      });
    }

    // Zoho signals application errors with a non-zero `code` even on HTTP 200.
    if (body && typeof body.code === 'number' && body.code !== 0) {
      throw new ApiError(body.message || `Zoho error ${body.code}`, {
        code: body.code,
        status: res.status,
      });
    }

    return body;
  }

  /**
   * Auto-paginating GET. Walks `page_context.has_more_page`, concatenating each
   * page's array (the `key` resource array, or the first array found). Caps at
   * `maxRows` and reports `truncated`.
   * @param {string} path
   * @param {{ searchParams?: Record<string, any>, key?: string }} [options]
   * @param {{ maxRows?: number, pageSize?: number }} [pageOpts]
   */
  async function getAll(path, { searchParams = {}, key } = {}, { maxRows = MAX_ALL_ROWS, pageSize = MAX_PAGE_SIZE } = {}) {
    const base = { ...searchParams };
    delete base.page;
    delete base.per_page;

    const all = [];
    let page = 1;
    let pageContext = null;
    let truncated = false;

    while (true) {
      const r = await request('GET', path, undefined, {
        searchParams: { ...base, page, per_page: pageSize },
      });
      const rows = key ? (r?.[key] ?? []) : firstArray(r);
      pageContext = r?.page_context ?? null;

      if (all.length + rows.length > maxRows) {
        all.push(...rows.slice(0, maxRows - all.length));
        truncated = true;
        break;
      }
      all.push(...rows);

      if (!pageContext?.has_more_page) break;
      page++;
    }

    return { data: all, page_context: pageContext, truncated };
  }

  return {
    get: (path, options) => request('GET', path, undefined, options),
    post: (path, body, options) => request('POST', path, body ?? {}, options),
    put: (path, body, options) => request('PUT', path, body ?? {}, options),
    delete: (path, options) => request('DELETE', path, undefined, options),
    upload: (path, file, options) => request('POST', path, toFormData(file), options),
    getAll,
  };
}
