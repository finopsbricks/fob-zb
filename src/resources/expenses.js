// @ts-check
/**
 * The `expenses` resource — expense transactions, with write + receipt upload.
 * An expense debits `account_id` and credits `paid_through_account_id` (cash,
 * bank, credit card, or a liability such as Employee Reimbursements).
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Expense.types.js').Expense} Expense
 * @typedef {Omit<import('../types/general/index.js').UploadFile, 'field'>} FileUpload
 */
import { baseResource, writeResource } from './_base.js';

/**
 * @typedef {Object} ExpensesApi
 * @property {(params?: object) => Promise<{ data: Expense[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Expense[]>} getAll
 * @property {(id: string) => Promise<Expense|null>} get
 * @property {(body: object) => Promise<Expense|null>} create
 * @property {(id: string, body: object) => Promise<Expense|null>} update
 * @property {(id: string) => Promise<any>} delete
 * @property {(id: string, file: FileUpload) => Promise<any>} addReceipt  Attach the receipt file to the expense
 */

const P = '/expenses';

/** @param {Transport} ctx @returns {ExpensesApi} */
export function buildExpenses(ctx) {
  return {
    ...baseResource(ctx, { path: P, listKey: 'expenses', itemKey: 'expense' }),
    ...writeResource(ctx, { path: P, itemKey: 'expense' }),
    addReceipt: (id, file) => ctx.upload(`${P}/${encodeURIComponent(id)}/receipt`, { ...file, field: 'receipt' }),
  };
}
