// @ts-check
/**
 * Shared read scaffolding for Zoho Books resources. Zoho's list/get shape is
 * uniform — a plural-keyed array with `page_context`, and a singular-keyed record
 * — so `baseResource` supplies list/getAll/get once, and each `buildX(ctx)` spreads
 * it and adds resource-specific methods (create/update/actions land in later phases).
 *
 * Return shapes follow the family convention: `list` → `{ data, page_context }`,
 * `getAll` → flat array, `get` → the unwrapped record or null.
 *
 * @typedef {import('../types/general/index.js').Transport} Transport
 */

/**
 * @param {Transport} ctx
 * @param {{ path: string, listKey: string, itemKey: string }} spec
 */
export function baseResource(ctx, { path, listKey, itemKey }) {
  return {
    /** One page. Returns `{ data, page_context }`. */
    list: async (params = {}) => {
      const r = await ctx.get(path, { searchParams: params });
      return { data: r?.[listKey] ?? [], page_context: r?.page_context ?? null };
    },
    /** Every row, walking pagination. Returns a flat array (capped at MAX_ALL_ROWS). */
    getAll: async (params = {}) => (await ctx.getAll(path, { searchParams: params, key: listKey })).data,
    /** One record by id, or null. */
    get: (id) => ctx.get(`${path}/${encodeURIComponent(id)}`).then((r) => r?.[itemKey] ?? null),
  };
}

/**
 * Shared status/workflow actions for sales & purchase documents (estimates,
 * sales orders, credit notes, purchase orders): status transitions, submit for
 * approval, approve, and email. All are POSTs under the resource path.
 *
 * @param {Transport} ctx
 * @param {string} path
 */
export function documentActions(ctx, path) {
  const enc = encodeURIComponent;
  return {
    /** Transition status (state e.g. 'sent', 'void', 'open', 'billed'). */
    status: (id, state) => ctx.post(`${path}/${enc(id)}/status/${state}`),
    submit: (id) => ctx.post(`${path}/${enc(id)}/submit`),
    approve: (id) => ctx.post(`${path}/${enc(id)}/approve`),
    email: (id, body) => ctx.post(`${path}/${enc(id)}/email`, body ?? {}),
  };
}

/**
 * Stop/resume actions for recurring profiles (recurring invoices/bills/expenses).
 * @param {Transport} ctx
 * @param {string} path
 */
export function recurringActions(ctx, path) {
  const enc = encodeURIComponent;
  return {
    stop: (id) => ctx.post(`${path}/${enc(id)}/status/stop`),
    resume: (id) => ctx.post(`${path}/${enc(id)}/status/resume`),
  };
}

/**
 * Uniform write scaffolding — create (POST), update (PUT), delete (DELETE).
 * Zoho updates are PUT (full or partial body), not PATCH. `delete` returns the
 * raw envelope (callers rarely need its body).
 *
 * @param {Transport} ctx
 * @param {{ path: string, itemKey: string }} spec
 */
export function writeResource(ctx, { path, itemKey }) {
  return {
    /** Create a record (`body` uses Zoho field names). Returns the created record. */
    create: (body) => ctx.post(path, body).then((r) => r?.[itemKey] ?? null),
    /** Update a record (PUT). Returns the updated record. */
    update: (id, body) => ctx.put(`${path}/${encodeURIComponent(id)}`, body).then((r) => r?.[itemKey] ?? null),
    /** Delete a record. */
    delete: (id) => ctx.delete(`${path}/${encodeURIComponent(id)}`),
  };
}
