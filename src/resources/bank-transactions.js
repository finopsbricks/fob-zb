// @ts-check
/**
 * The `bank-transactions` resource — bank/credit-card feed transactions. Read
 * methods for now (categorize/match land in the banking-ops phase).
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/BankTransaction.types.js').BankTransaction} BankTransaction
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} BankTransactionsApi
 * @property {(params?: object) => Promise<{ data: BankTransaction[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<BankTransaction[]>} getAll
 * @property {(id: string) => Promise<BankTransaction|null>} get
 */

/** @param {Transport} ctx @returns {BankTransactionsApi} */
export function buildBankTransactions(ctx) {
  return {
    ...baseResource(ctx, { path: '/banktransactions', listKey: 'banktransactions', itemKey: 'banktransaction' }),
  };
}
