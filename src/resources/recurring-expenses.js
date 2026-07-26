// @ts-check
/**
 * The `recurring-expenses` resource — recurring expense profiles. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/RecurringExpense.types.js').RecurringExpense} RecurringExpense
 */
import { baseResource, recurringActions } from './_base.js';

/**
 * @typedef {Object} RecurringExpensesApi
 * @property {(params?: object) => Promise<{ data: RecurringExpense[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<RecurringExpense[]>} getAll
 * @property {(id: string) => Promise<RecurringExpense|null>} get
 * @property {(id: string) => Promise<any>} stop
 * @property {(id: string) => Promise<any>} resume
 */

/** @param {Transport} ctx @returns {RecurringExpensesApi} */
export function buildRecurringExpenses(ctx) {
  const P = '/recurringexpenses';
  return {
    ...baseResource(ctx, { path: P, listKey: 'recurring_expenses', itemKey: 'recurring_expense' }),
    ...recurringActions(ctx, P),
  };
}
