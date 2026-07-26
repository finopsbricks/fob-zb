// @ts-check
/**
 * The `bank-transactions` resource — bank/credit-card feed transactions, with
 * manual create/delete + the reconciliation ops (categorize/match/exclude).
 *
 * Endpoint quirks: categorize/match/exclude/restore live under the
 * `/banktransactions/uncategorized/{id}/…` sub-path; uncategorize/unmatch under
 * `/banktransactions/{id}/…`. Categorize has dedicated targets
 * (expenses, vendorpayments, customerpayments, …) plus a generic form.
 *
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/BankTransaction.types.js').BankTransaction} BankTransaction
 */
import { baseResource, writeResource } from './_base.js';

/**
 * @typedef {Object} BankTransactionsApi
 * @property {(params?: object) => Promise<{ data: BankTransaction[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<BankTransaction[]>} getAll
 * @property {(id: string) => Promise<BankTransaction|null>} get
 * @property {(body: object) => Promise<BankTransaction|null>} create
 * @property {(id: string, body: object) => Promise<BankTransaction|null>} update
 * @property {(id: string) => Promise<any>} delete
 * @property {(id: string, target: string|undefined, body: object) => Promise<any>} categorize
 * @property {(id: string, body: object) => Promise<any>} match
 * @property {(id: string) => Promise<any>} unmatch
 * @property {(id: string) => Promise<any>} uncategorize
 * @property {(id: string) => Promise<any>} exclude
 * @property {(id: string) => Promise<any>} restore
 */

const P = '/banktransactions';
const enc = encodeURIComponent;

/** @param {Transport} ctx @returns {BankTransactionsApi} */
export function buildBankTransactions(ctx) {
  return {
    ...baseResource(ctx, { path: P, listKey: 'banktransactions', itemKey: 'banktransaction' }),
    ...writeResource(ctx, { path: P, itemKey: 'banktransaction' }),
    /** Categorize an uncategorized transaction. `target` picks a dedicated form (e.g. 'expenses'); omit for the generic form. */
    categorize: (id, target, body) =>
      ctx.post(`${P}/uncategorized/${enc(id)}/categorize${target ? `/${target}` : ''}`, body ?? {}),
    /** Match an uncategorized transaction to existing records (body carries the matches). */
    match: (id, body) => ctx.post(`${P}/uncategorized/${enc(id)}/match`, body ?? {}),
    unmatch: (id) => ctx.post(`${P}/${enc(id)}/unmatch`),
    uncategorize: (id) => ctx.post(`${P}/${enc(id)}/uncategorize`),
    exclude: (id) => ctx.post(`${P}/uncategorized/${enc(id)}/exclude`),
    restore: (id) => ctx.post(`${P}/uncategorized/${enc(id)}/restore`),
  };
}
