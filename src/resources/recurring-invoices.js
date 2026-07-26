// @ts-check
/**
 * The `recurring-invoices` resource — recurring invoice profiles. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/RecurringInvoice.types.js').RecurringInvoice} RecurringInvoice
 */
import { baseResource, recurringActions } from './_base.js';

/**
 * @typedef {Object} RecurringInvoicesApi
 * @property {(params?: object) => Promise<{ data: RecurringInvoice[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<RecurringInvoice[]>} getAll
 * @property {(id: string) => Promise<RecurringInvoice|null>} get
 * @property {(id: string) => Promise<any>} stop
 * @property {(id: string) => Promise<any>} resume
 */

/** @param {Transport} ctx @returns {RecurringInvoicesApi} */
export function buildRecurringInvoices(ctx) {
  const P = '/recurringinvoices';
  return {
    ...baseResource(ctx, { path: P, listKey: 'recurring_invoices', itemKey: 'recurring_invoice' }),
    ...recurringActions(ctx, P),
  };
}
