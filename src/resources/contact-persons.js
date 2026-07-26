// @ts-check
/**
 * The `contact-persons` resource — contact persons. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/ContactPerson.types.js').ContactPerson} ContactPerson
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} ContactPersonsApi
 * @property {(params?: object) => Promise<{ data: ContactPerson[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<ContactPerson[]>} getAll
 * @property {(id: string) => Promise<ContactPerson|null>} get
 */

/** @param {Transport} ctx @returns {ContactPersonsApi} */
export function buildContactPersons(ctx) {
  return { ...baseResource(ctx, { path: '/contacts/contactpersons', listKey: 'contact_persons', itemKey: 'contact_person' }) };
}
