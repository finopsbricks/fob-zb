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
 */

const P = '/bankaccounts';

/** @param {Transport} ctx @returns {BankAccountsApi} */
export function buildBankAccounts(ctx) {
  return {
    ...baseResource(ctx, { path: P, listKey: 'bankaccounts', itemKey: 'bankaccount' }),
    ...writeResource(ctx, { path: P, itemKey: 'bankaccount' }),
    markActive: (id) => ctx.post(`${P}/${encodeURIComponent(id)}/active`),
    markInactive: (id) => ctx.post(`${P}/${encodeURIComponent(id)}/inactive`),
  };
}
