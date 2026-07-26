// @ts-check
/**
 * The `organizations` resource — Zoho Books tenants.
 *
 * `buildOrganizations(ctx)` is the single place organization endpoint paths live.
 * `list` is special: it needs no `organization_id`, so it's the bootstrap call
 * used to discover the id every other resource requires.
 *
 * Return shapes mirror the family convention: `list` → `{ data, page_context }`,
 * `getAll` → flat array, single-record ops → the unwrapped record or null.
 *
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Organization.types.js').Organization} Organization
 */

/**
 * @typedef {Object} OrganizationsApi
 * @property {(params?: object) => Promise<{ data: Organization[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Organization[]>} getAll
 * @property {(id: string) => Promise<Organization|null>} get
 */

/**
 * @param {Transport} ctx
 * @returns {OrganizationsApi}
 */
export function buildOrganizations(ctx) {
  return {
    list: async (params = {}) => {
      const r = await ctx.get('/organizations', { searchParams: params });
      return { data: r?.organizations ?? [], page_context: r?.page_context ?? null };
    },
    getAll: async (params = {}) =>
      (await ctx.getAll('/organizations', { searchParams: params, key: 'organizations' })).data,
    get: (id) => ctx.get(`/organizations/${encodeURIComponent(id)}`).then((r) => r?.organization ?? null),
  };
}
