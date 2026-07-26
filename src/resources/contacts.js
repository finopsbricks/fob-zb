// @ts-check
/**
 * The `contacts` resource — customers & vendors. Every contact endpoint path
 * lives here. Read methods for now (list/getAll/get); create/update/actions
 * (email, statements, activate/deactivate) land in the write phase.
 *
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Contact.types.js').Contact} Contact
 */

import { baseResource } from './_base.js';

/**
 * @typedef {Object} ContactsApi
 * @property {(params?: object) => Promise<{ data: Contact[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Contact[]>} getAll
 * @property {(id: string) => Promise<Contact|null>} get
 */

/**
 * @param {Transport} ctx
 * @returns {ContactsApi}
 */
export function buildContacts(ctx) {
  return {
    ...baseResource(ctx, { path: '/contacts', listKey: 'contacts', itemKey: 'contact' }),
  };
}
