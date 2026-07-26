// @ts-check
/**
 * The `invoices` resource — core AR document. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Invoice.types.js').Invoice} Invoice
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} InvoicesApi
 * @property {(params?: object) => Promise<{ data: Invoice[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Invoice[]>} getAll
 * @property {(id: string) => Promise<Invoice|null>} get
 */

/** @param {Transport} ctx @returns {InvoicesApi} */
export function buildInvoices(ctx) {
  return { ...baseResource(ctx, { path: '/invoices', listKey: 'invoices', itemKey: 'invoice' }) };
}
