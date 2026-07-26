// @ts-check
/**
 * The credential-bound transport handed to each `buildX(ctx)` resource module.
 * Produced by `createTransport(credentials)` (src/http.js). Methods carry no
 * `credentials` argument — the seam is closed over — and inject `organization_id`
 * plus the `Zoho-oauthtoken` header automatically.
 *
 * @typedef {Object} RequestOptions
 * @property {Record<string, any>} [searchParams]  Extra query params (organization_id is added automatically)
 *
 * @typedef {Object} GetAllOptions
 * @property {Record<string, any>} [searchParams]
 * @property {string} [key]  Resource array key in the envelope (e.g. 'invoices'); defaults to the first array found
 *
 * @typedef {Object} GetAllResult
 * @property {any[]} data
 * @property {object|null} page_context
 * @property {boolean} truncated
 *
 * @typedef {Object} Transport
 * @property {(path: string, options?: RequestOptions) => Promise<any>} get
 * @property {(path: string, body?: any, options?: RequestOptions) => Promise<any>} post
 * @property {(path: string, body?: any, options?: RequestOptions) => Promise<any>} put
 * @property {(path: string, options?: RequestOptions) => Promise<any>} delete
 * @property {(path: string, options?: GetAllOptions, pageOpts?: { maxRows?: number, pageSize?: number }) => Promise<GetAllResult>} getAll
 */

export {};
