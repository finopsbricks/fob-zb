// @ts-check
/**
 * The `chart-of-accounts` resource — the general ledger accounts. Endpoint path
 * is un-hyphenated (`/chartofaccounts`); the single-record key is `chart_of_account`.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Account.types.js').Account} Account
 * @typedef {import('../types/api/GeneralLedger.types.js').AccountTransaction} AccountTransaction
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
 * @property {(account_id: string, params?: object) => Promise<{ data: AccountTransaction[], page_context: object|null }>} listTransactions
 * @property {(account_id: string, params?: object) => Promise<{ data: AccountTransaction[], truncated: boolean }>} getAllTransactions
 */

const P = '/chartofaccounts';

/** @param {Transport} ctx @returns {ChartOfAccountsApi} */
export function buildChartOfAccounts(ctx) {
  return {
    ...baseResource(ctx, { path: P, listKey: 'chartofaccounts', itemKey: 'chart_of_account' }),
    ...writeResource(ctx, { path: P, itemKey: 'chart_of_account' }),
    markActive: (id) => ctx.post(`${P}/${encodeURIComponent(id)}/active`),
    markInactive: (id) => ctx.post(`${P}/${encodeURIComponent(id)}/inactive`),
    /**
     * One page of the posted legs on an account (`GET /chartofaccounts/transactions`).
     * Zoho returns nothing without `account_id`, and ignores date filters here:
     * every read is the account's whole history, newest first.
     */
    listTransactions: async (account_id, params = {}) => {
      const r = await ctx.get(`${P}/transactions`, { searchParams: { ...params, account_id } });
      return { data: r?.transactions ?? [], page_context: r?.page_context ?? null };
    },
    /**
     * Every posted leg on an account, walking pagination. Returns `truncated`
     * rather than dropping it like other `getAll`s: a capped ledger read looks
     * complete and silently loses entries.
     */
    getAllTransactions: async (account_id, params = {}) => {
      const r = await ctx.getAll(`${P}/transactions`, { searchParams: { ...params, account_id }, key: 'transactions' });
      return { data: r.data, truncated: r.truncated };
    },
  };
}
