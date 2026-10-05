// @ts-check
/**
 * Reports. Only the general ledger for now: one call returns every account's
 * debit and credit totals over a period, which makes it a cheap way to see
 * which accounts moved. `/reports/*` is what Zoho's web app uses and is not in
 * Zoho's public API docs, so treat its shape as less stable than the rest.
 *
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/GeneralLedger.types.js').GeneralLedgerRow} GeneralLedgerRow
 */

/**
 * @typedef {Object} ReportsApi
 * @property {(params: { from_date: string, to_date: string, [k: string]: any }) => Promise<{ data: GeneralLedgerRow[], page_context: object|null }>} generalLedger
 */

/** @param {Transport} ctx @returns {ReportsApi} */
export function buildReports(ctx) {
  return {
    /**
     * Every account's totals between `from_date` and `to_date` (YYYY-MM-DD,
     * inclusive). Zoho refuses the report without `from_date` (code 101007),
     * so both are required here rather than left to a cryptic API error.
     */
    generalLedger: async (params) => {
      if (!params?.from_date || !params?.to_date) {
        throw new Error('reports.generalLedger: from_date and to_date are required (YYYY-MM-DD)');
      }
      const r = await ctx.get('/reports/generalledger', { searchParams: params });
      return { data: r?.generalledger ?? [], page_context: r?.page_context ?? null };
    },
  };
}
