// @ts-check
/**
 * The `expenses` resource — expense transactions. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Expense.types.js').Expense} Expense
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} ExpensesApi
 * @property {(params?: object) => Promise<{ data: Expense[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Expense[]>} getAll
 * @property {(id: string) => Promise<Expense|null>} get
 */

/** @param {Transport} ctx @returns {ExpensesApi} */
export function buildExpenses(ctx) {
  return { ...baseResource(ctx, { path: '/expenses', listKey: 'expenses', itemKey: 'expense' }) };
}
