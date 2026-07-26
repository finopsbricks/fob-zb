// @ts-check
/**
 * The `bank-accounts` resource — bank & credit-card accounts. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/BankAccount.types.js').BankAccount} BankAccount
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} BankAccountsApi
 * @property {(params?: object) => Promise<{ data: BankAccount[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<BankAccount[]>} getAll
 * @property {(id: string) => Promise<BankAccount|null>} get
 */

/** @param {Transport} ctx @returns {BankAccountsApi} */
export function buildBankAccounts(ctx) {
  return { ...baseResource(ctx, { path: '/bankaccounts', listKey: 'bankaccounts', itemKey: 'bankaccount' }) };
}
