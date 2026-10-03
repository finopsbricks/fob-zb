// @ts-check
/**
 * The `bills` resource — vendor bills (payables), with write + status actions.
 * Bill line items carry an `account_id` (the expense/GL account) — the key
 * distinction from invoice lines.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Bill.types.js').Bill} Bill
 * @typedef {Omit<import('../types/general/index.js').UploadFile, 'field'>} FileUpload
 */
import { baseResource, writeResource } from './_base.js';

/**
 * @typedef {Object} BillsApi
 * @property {(params?: object) => Promise<{ data: Bill[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Bill[]>} getAll
 * @property {(id: string) => Promise<Bill|null>} get
 * @property {(body: object) => Promise<Bill|null>} create
 * @property {(id: string, body: object) => Promise<Bill|null>} update
 * @property {(id: string) => Promise<any>} delete
 * @property {(id: string) => Promise<any>} markOpen
 * @property {(id: string) => Promise<any>} markVoid
 * @property {(id: string, file: FileUpload) => Promise<any>} addAttachment  Attach a file (PDF, image) to the bill
 */

const P = '/bills';
const enc = encodeURIComponent;

/** @param {Transport} ctx @returns {BillsApi} */
export function buildBills(ctx) {
  return {
    ...baseResource(ctx, { path: P, listKey: 'bills', itemKey: 'bill' }),
    ...writeResource(ctx, { path: P, itemKey: 'bill' }),
    markOpen: (id) => ctx.post(`${P}/${enc(id)}/status/open`),
    markVoid: (id) => ctx.post(`${P}/${enc(id)}/status/void`),
    addAttachment: (id, file) => ctx.upload(`${P}/${enc(id)}/attachment`, { ...file, field: 'attachment' }),
  };
}
