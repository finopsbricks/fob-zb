// @ts-check
/**
 * The `chart-of-accounts` resource — the general ledger accounts. Read methods
 * for now. Endpoint path is un-hyphenated (`/chartofaccounts`); the single-record
 * key is `chart_of_account`.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Account.types.js').Account} Account
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} ChartOfAccountsApi
 * @property {(params?: object) => Promise<{ data: Account[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Account[]>} getAll
 * @property {(id: string) => Promise<Account|null>} get
 */

/** @param {Transport} ctx @returns {ChartOfAccountsApi} */
export function buildChartOfAccounts(ctx) {
  return {
    ...baseResource(ctx, { path: '/chartofaccounts', listKey: 'chartofaccounts', itemKey: 'chart_of_account' }),
  };
}
