// @ts-check
/**
 * The `credit-notes` resource — credit notes. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/CreditNote.types.js').CreditNote} CreditNote
 */
import { baseResource, writeResource, documentActions } from './_base.js';

/**
 * @typedef {Object} CreditNotesApi
 * @property {(params?: object) => Promise<{ data: CreditNote[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<CreditNote[]>} getAll
 * @property {(id: string) => Promise<CreditNote|null>} get
 * @property {(body: object) => Promise<CreditNote|null>} create
 * @property {(id: string, body: object) => Promise<CreditNote|null>} update
 * @property {(id: string) => Promise<any>} delete
 * @property {(id: string, state: string) => Promise<any>} status
 * @property {(id: string) => Promise<any>} submit
 * @property {(id: string) => Promise<any>} approve
 * @property {(id: string, body?: object) => Promise<any>} email
 */

const P = '/creditnotes';

/** @param {Transport} ctx @returns {CreditNotesApi} */
export function buildCreditNotes(ctx) {
  return {
    ...baseResource(ctx, { path: P, listKey: 'creditnotes', itemKey: 'creditnote' }),
    ...writeResource(ctx, { path: P, itemKey: 'creditnote' }),
    ...documentActions(ctx, P),
  };
}
