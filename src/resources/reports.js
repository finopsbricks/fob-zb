// @ts-check
/**
 * Reports. `/reports/*` is what Zoho's web app uses and is not in Zoho's
 * public API docs, so treat its shape as less stable than the rest.
 *
 * - `generalLedger`: every account's debit and credit totals over a period in
 *   one call, a cheap way to see which accounts moved.
 * - `accountTransactions` / `getAllAccountTransactions`: the "Account
 *   Transactions" report, every posted leg on every account over a period.
 *   Unlike `chartOfAccounts.getAllTransactions` (one account per call), every
 *   leg here carries the source document's `transaction_id`, payments
 *   included: a vendor payment's bank, Accounts Payable and advance legs all
 *   share the payment's id, where the per-account endpoint leaves it blank.
 *
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/GeneralLedger.types.js').GeneralLedgerRow} GeneralLedgerRow
 * @typedef {import('../types/api/GeneralLedger.types.js').ReportAccountTransaction} ReportAccountTransaction
 */
import { MAX_ALL_ROWS, MAX_PAGE_SIZE } from '../http.js';

/**
 * @typedef {Object} ReportsApi
 * @property {(params: { from_date: string, to_date: string, [k: string]: any }) => Promise<{ data: GeneralLedgerRow[], page_context: object|null }>} generalLedger
 * @property {(params: { from_date: string, to_date: string, page?: number, per_page?: number, [k: string]: any }) => Promise<{ data: ReportAccountTransaction[], page_context: any }>} accountTransactions
 * @property {(params: { from_date: string, to_date: string, [k: string]: any }) => Promise<{ data: ReportAccountTransaction[], truncated: boolean }>} getAllAccountTransactions
 */

/** @param {string} name @param {any} params */
function requirePeriod(name, params) {
  if (!params?.from_date || !params?.to_date) {
    throw new Error(`reports.${name}: from_date and to_date are required (YYYY-MM-DD)`);
  }
}

/** @param {Transport} ctx @returns {ReportsApi} */
export function buildReports(ctx) {
  /**
   * One page of the Account Transactions report. Without
   * `filter_by: TransactionDate.CustomDate` Zoho ignores the dates and reports
   * this month, so it is set here. Rows come nested one level
   * (`account_transactions[].account_transactions[]`) and are flattened.
   * @param {any} params
   */
  const accountTransactions = async (params) => {
    requirePeriod('accountTransactions', params);
    const r = await ctx.get('/reports/accounttransaction', {
      searchParams: { filter_by: 'TransactionDate.CustomDate', per_page: MAX_PAGE_SIZE, ...params },
    });
    const data = (r?.account_transactions ?? []).flatMap((/** @type {any} */ g) => g?.account_transactions ?? []);
    return { data, page_context: r?.page_context ?? null };
  };

  return {
    /**
     * Every account's totals between `from_date` and `to_date` (YYYY-MM-DD,
     * inclusive). Zoho refuses the report without `from_date` (code 101007),
     * so both are required here rather than left to a cryptic API error.
     */
    generalLedger: async (params) => {
      requirePeriod('generalLedger', params);
      const r = await ctx.get('/reports/generalledger', { searchParams: params });
      return { data: r?.generalledger ?? [], page_context: r?.page_context ?? null };
    },
    accountTransactions,
    /**
     * Every leg over the period, walking pages. Returns `truncated` rather
     * than dropping it: a capped ledger read looks complete and silently
     * loses entries.
     */
    getAllAccountTransactions: async (params) => {
      /** @type {ReportAccountTransaction[]} */
      const data = [];
      for (let page = 1; ; page++) {
        const r = await accountTransactions({ ...params, page });
        data.push(...r.data);
        if (!r.page_context?.has_more_page) return { data, truncated: false };
        if (data.length >= MAX_ALL_ROWS) return { data, truncated: true };
      }
    },
  };
}
