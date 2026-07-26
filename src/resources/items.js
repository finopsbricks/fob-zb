// @ts-check
/**
 * The `items` resource — products & services.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Item.types.js').Item} Item
 */
import { baseResource, writeResource } from './_base.js';

/**
 * @typedef {Object} ItemsApi
 * @property {(params?: object) => Promise<{ data: Item[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Item[]>} getAll
 * @property {(id: string) => Promise<Item|null>} get
 * @property {(body: object) => Promise<Item|null>} create
 * @property {(id: string, body: object) => Promise<Item|null>} update
 * @property {(id: string) => Promise<any>} delete
 * @property {(id: string) => Promise<any>} markActive
 * @property {(id: string) => Promise<any>} markInactive
 */

const P = '/items';

/** @param {Transport} ctx @returns {ItemsApi} */
export function buildItems(ctx) {
  return {
    ...baseResource(ctx, { path: P, listKey: 'items', itemKey: 'item' }),
    ...writeResource(ctx, { path: P, itemKey: 'item' }),
    markActive: (id) => ctx.post(`${P}/${encodeURIComponent(id)}/active`),
    markInactive: (id) => ctx.post(`${P}/${encodeURIComponent(id)}/inactive`),
  };
}
