// @ts-check
/**
 * The `recurring-bills` resource — recurring bill profiles. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/RecurringBill.types.js').RecurringBill} RecurringBill
 */
import { baseResource, recurringActions } from './_base.js';

/**
 * @typedef {Object} RecurringBillsApi
 * @property {(params?: object) => Promise<{ data: RecurringBill[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<RecurringBill[]>} getAll
 * @property {(id: string) => Promise<RecurringBill|null>} get
 * @property {(id: string) => Promise<any>} stop
 * @property {(id: string) => Promise<any>} resume
 */

/** @param {Transport} ctx @returns {RecurringBillsApi} */
export function buildRecurringBills(ctx) {
  const P = '/recurringbills';
  return {
    ...baseResource(ctx, { path: P, listKey: 'recurring_bills', itemKey: 'recurring_bill' }),
    ...recurringActions(ctx, P),
  };
}
