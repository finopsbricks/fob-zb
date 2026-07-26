// @ts-check
/**
 * The `credit-notes` resource — credit notes. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/CreditNote.types.js').CreditNote} CreditNote
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} CreditNotesApi
 * @property {(params?: object) => Promise<{ data: CreditNote[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<CreditNote[]>} getAll
 * @property {(id: string) => Promise<CreditNote|null>} get
 */

/** @param {Transport} ctx @returns {CreditNotesApi} */
export function buildCreditNotes(ctx) {
  return { ...baseResource(ctx, { path: '/creditnotes', listKey: 'creditnotes', itemKey: 'creditnote' }) };
}
