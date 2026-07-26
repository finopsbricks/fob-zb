// @ts-check
/**
 * The `sales-orders` resource — sales orders. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/SalesOrder.types.js').SalesOrder} SalesOrder
 */
import { baseResource, writeResource, documentActions } from './_base.js';

/**
 * @typedef {Object} SalesOrdersApi
 * @property {(params?: object) => Promise<{ data: SalesOrder[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<SalesOrder[]>} getAll
 * @property {(id: string) => Promise<SalesOrder|null>} get
 * @property {(body: object) => Promise<SalesOrder|null>} create
 * @property {(id: string, body: object) => Promise<SalesOrder|null>} update
 * @property {(id: string) => Promise<any>} delete
 * @property {(id: string, state: string) => Promise<any>} status
 * @property {(id: string) => Promise<any>} submit
 * @property {(id: string) => Promise<any>} approve
 * @property {(id: string, body?: object) => Promise<any>} email
 */

const P = '/salesorders';

/** @param {Transport} ctx @returns {SalesOrdersApi} */
export function buildSalesOrders(ctx) {
  return {
    ...baseResource(ctx, { path: P, listKey: 'salesorders', itemKey: 'salesorder' }),
    ...writeResource(ctx, { path: P, itemKey: 'salesorder' }),
    ...documentActions(ctx, P),
  };
}
