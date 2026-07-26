// @ts-check
/**
 * The `contacts` resource — customers & vendors. Every contact endpoint path
 * lives here. Read methods for now (list/getAll/get); create/update/actions
 * (email, statements, activate/deactivate) land in the write phase.
 *
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Contact.types.js').Contact} Contact
 */

import { baseResource, writeResource } from './_base.js';

/**
 * @typedef {Object} ContactsApi
 * @property {(params?: object) => Promise<{ data: Contact[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Contact[]>} getAll
 * @property {(id: string) => Promise<Contact|null>} get
 * @property {(body: object) => Promise<Contact|null>} create
 * @property {(id: string, body: object) => Promise<Contact|null>} update
 * @property {(id: string) => Promise<any>} delete
 * @property {(id: string) => Promise<any>} markActive
 * @property {(id: string) => Promise<any>} markInactive
 */

const P = '/contacts';

/**
 * @param {Transport} ctx
 * @returns {ContactsApi}
 */
export function buildContacts(ctx) {
  return {
    ...baseResource(ctx, { path: P, listKey: 'contacts', itemKey: 'contact' }),
    ...writeResource(ctx, { path: P, itemKey: 'contact' }),
    /** Mark a contact active. */
    markActive: (id) => ctx.post(`${P}/${encodeURIComponent(id)}/active`),
    /** Mark a contact inactive. */
    markInactive: (id) => ctx.post(`${P}/${encodeURIComponent(id)}/inactive`),
  };
}
