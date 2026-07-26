// @ts-check
/**
 * The `chart-of-accounts` resource — the general ledger accounts. Endpoint path
 * is un-hyphenated (`/chartofaccounts`); the single-record key is `chart_of_account`.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Account.types.js').Account} Account
 */
import { baseResource, writeResource } from './_base.js';

/**
 * @typedef {Object} ChartOfAccountsApi
 * @property {(params?: object) => Promise<{ data: Account[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Account[]>} getAll
 * @property {(id: string) => Promise<Account|null>} get
 * @property {(body: object) => Promise<Account|null>} create
 * @property {(id: string, body: object) => Promise<Account|null>} update
 * @property {(id: string) => Promise<any>} delete
 * @property {(id: string) => Promise<any>} markActive
 * @property {(id: string) => Promise<any>} markInactive
 */

const P = '/chartofaccounts';

/** @param {Transport} ctx @returns {ChartOfAccountsApi} */
export function buildChartOfAccounts(ctx) {
  return {
    ...baseResource(ctx, { path: P, listKey: 'chartofaccounts', itemKey: 'chart_of_account' }),
    ...writeResource(ctx, { path: P, itemKey: 'chart_of_account' }),
    markActive: (id) => ctx.post(`${P}/${encodeURIComponent(id)}/active`),
    markInactive: (id) => ctx.post(`${P}/${encodeURIComponent(id)}/inactive`),
  };
}
