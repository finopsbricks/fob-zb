// @ts-check
/**
 * The `recurring-bills` resource — recurring bill profiles. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/RecurringBill.types.js').RecurringBill} RecurringBill
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} RecurringBillsApi
 * @property {(params?: object) => Promise<{ data: RecurringBill[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<RecurringBill[]>} getAll
 * @property {(id: string) => Promise<RecurringBill|null>} get
 */

/** @param {Transport} ctx @returns {RecurringBillsApi} */
export function buildRecurringBills(ctx) {
  return { ...baseResource(ctx, { path: '/recurringbills', listKey: 'recurring_bills', itemKey: 'recurring_bill' }) };
}
