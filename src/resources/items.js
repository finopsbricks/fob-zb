// @ts-check
/**
 * The `items` resource — products & services. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Item.types.js').Item} Item
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} ItemsApi
 * @property {(params?: object) => Promise<{ data: Item[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Item[]>} getAll
 * @property {(id: string) => Promise<Item|null>} get
 */

/** @param {Transport} ctx @returns {ItemsApi} */
export function buildItems(ctx) {
  return { ...baseResource(ctx, { path: '/items', listKey: 'items', itemKey: 'item' }) };
}
