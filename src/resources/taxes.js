// @ts-check
/**
 * The `taxes` resource — configured taxes. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Tax.types.js').Tax} Tax
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} TaxesApi
 * @property {(params?: object) => Promise<{ data: Tax[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Tax[]>} getAll
 * @property {(id: string) => Promise<Tax|null>} get
 */

/** @param {Transport} ctx @returns {TaxesApi} */
export function buildTaxes(ctx) {
  return { ...baseResource(ctx, { path: '/settings/taxes', listKey: 'taxes', itemKey: 'tax' }) };
}
