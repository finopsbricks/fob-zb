// @ts-check
/**
 * The `bills` resource — vendor bills (payables). Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Bill.types.js').Bill} Bill
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} BillsApi
 * @property {(params?: object) => Promise<{ data: Bill[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Bill[]>} getAll
 * @property {(id: string) => Promise<Bill|null>} get
 */

/** @param {Transport} ctx @returns {BillsApi} */
export function buildBills(ctx) {
  return { ...baseResource(ctx, { path: '/bills', listKey: 'bills', itemKey: 'bill' }) };
}
