// @ts-check
/**
 * The `recurring-expenses` resource — recurring expense profiles. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/RecurringExpense.types.js').RecurringExpense} RecurringExpense
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} RecurringExpensesApi
 * @property {(params?: object) => Promise<{ data: RecurringExpense[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<RecurringExpense[]>} getAll
 * @property {(id: string) => Promise<RecurringExpense|null>} get
 */

/** @param {Transport} ctx @returns {RecurringExpensesApi} */
export function buildRecurringExpenses(ctx) {
  return { ...baseResource(ctx, { path: '/recurringexpenses', listKey: 'recurring_expenses', itemKey: 'recurring_expense' }) };
}
