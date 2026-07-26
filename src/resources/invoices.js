// @ts-check
/**
 * The `invoices` resource — core AR document, with write + status actions.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Invoice.types.js').Invoice} Invoice
 */
import { baseResource, writeResource } from './_base.js';

/**
 * @typedef {Object} InvoicesApi
 * @property {(params?: object) => Promise<{ data: Invoice[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Invoice[]>} getAll
 * @property {(id: string) => Promise<Invoice|null>} get
 * @property {(body: object) => Promise<Invoice|null>} create
 * @property {(id: string, body: object) => Promise<Invoice|null>} update
 * @property {(id: string) => Promise<any>} delete
 * @property {(id: string) => Promise<any>} markSent
 * @property {(id: string) => Promise<any>} markVoid
 * @property {(id: string) => Promise<any>} markDraft
 * @property {(id: string, body?: object) => Promise<any>} email
 * @property {(id: string) => Promise<any>} writeOff
 * @property {(id: string) => Promise<any>} cancelWriteOff
 */

const P = '/invoices';
const enc = encodeURIComponent;

/** @param {Transport} ctx @returns {InvoicesApi} */
export function buildInvoices(ctx) {
  return {
    ...baseResource(ctx, { path: P, listKey: 'invoices', itemKey: 'invoice' }),
    ...writeResource(ctx, { path: P, itemKey: 'invoice' }),
    markSent: (id) => ctx.post(`${P}/${enc(id)}/status/sent`),
    markVoid: (id) => ctx.post(`${P}/${enc(id)}/status/void`),
    markDraft: (id) => ctx.post(`${P}/${enc(id)}/status/draft`),
    email: (id, body) => ctx.post(`${P}/${enc(id)}/email`, body ?? {}),
    writeOff: (id) => ctx.post(`${P}/${enc(id)}/writeoff`),
    cancelWriteOff: (id) => ctx.post(`${P}/${enc(id)}/writeoff/cancel`),
  };
}
