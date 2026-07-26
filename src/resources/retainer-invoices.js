// @ts-check
/**
 * The `retainer-invoices` resource — retainer invoices. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/RetainerInvoice.types.js').RetainerInvoice} RetainerInvoice
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} RetainerInvoicesApi
 * @property {(params?: object) => Promise<{ data: RetainerInvoice[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<RetainerInvoice[]>} getAll
 * @property {(id: string) => Promise<RetainerInvoice|null>} get
 */

/** @param {Transport} ctx @returns {RetainerInvoicesApi} */
export function buildRetainerInvoices(ctx) {
  return { ...baseResource(ctx, { path: '/retainerinvoices', listKey: 'retainerinvoices', itemKey: 'retainerinvoice' }) };
}
