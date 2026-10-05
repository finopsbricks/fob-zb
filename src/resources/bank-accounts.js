// @ts-check
/**
 * The `bank-accounts` resource — bank & credit-card accounts.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/BankAccount.types.js').BankAccount} BankAccount
 */
import { baseResource, writeResource } from './_base.js';

/**
 * @typedef {Object} BankAccountsApi
 * @property {(params?: object) => Promise<{ data: BankAccount[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<BankAccount[]>} getAll
 * @property {(id: string) => Promise<BankAccount|null>} get
 * @property {(body: object) => Promise<BankAccount|null>} create
 * @property {(id: string, body: object) => Promise<BankAccount|null>} update
 * @property {(id: string) => Promise<any>} delete
 * @property {(id: string) => Promise<any>} markActive
 * @property {(id: string) => Promise<any>} markInactive
 * @property {(body: ImportStatementBody) => Promise<any>} importStatement
 * @property {(id: string) => Promise<any|null>} lastImportedStatement
 * @property {(id: string, statement_id: string) => Promise<any>} deleteLastImportedStatement
 */

/**
 * One statement for `importStatement`. Lines land in the account's feed as
 * uncategorized transactions, ready to categorize or match.
 *
 * Each line takes `date` (Zoho rejects `transaction_date` as an invalid date).
 * `debit_or_credit` is in the bank's terms: `debit` = money out, `credit` =
 * money in. Read back from `bankTransactions`, the same lines are in book
 * terms, so the sides swap. Re-importing an identical line adds nothing; a
 * line that differs in any field (e.g. amount) is added as a new line.
 * @typedef {Object} ImportStatementBody
 * @property {string} account_id
 * @property {string} start_date  YYYY-MM-DD
 * @property {string} end_date    YYYY-MM-DD
 * @property {Array<{ transaction_id?: string, date: string, debit_or_credit: 'debit'|'credit',
 *   amount: number, payee?: string, description?: string, reference_number?: string }>} transactions
 */

const P = '/bankaccounts';

/** @param {Transport} ctx @returns {BankAccountsApi} */
export function buildBankAccounts(ctx) {
  return {
    ...baseResource(ctx, { path: P, listKey: 'bankaccounts', itemKey: 'bankaccount' }),
    ...writeResource(ctx, { path: P, itemKey: 'bankaccount' }),
    markActive: (id) => ctx.post(`${P}/${encodeURIComponent(id)}/active`),
    markInactive: (id) => ctx.post(`${P}/${encodeURIComponent(id)}/inactive`),
    /** Import a bank/credit-card statement into the account's feed (POST /bankstatements). */
    importStatement: (body) => ctx.post('/bankstatements', body),
    /** The account's most recently imported statement, or null. */
    lastImportedStatement: (id) =>
      ctx.get(`${P}/${encodeURIComponent(id)}/statement/lastimported`).then((r) => r?.statement ?? null),
    /** Delete the account's last imported statement and its feed lines. Repeat to walk back further. */
    deleteLastImportedStatement: (id, statement_id) =>
      ctx.delete(`${P}/${encodeURIComponent(id)}/statement/${encodeURIComponent(statement_id)}`),
  };
}
