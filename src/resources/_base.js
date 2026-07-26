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
