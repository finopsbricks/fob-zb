// @ts-check
/**
 * The `sales-orders` resource — sales orders. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/SalesOrder.types.js').SalesOrder} SalesOrder
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} SalesOrdersApi
 * @property {(params?: object) => Promise<{ data: SalesOrder[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<SalesOrder[]>} getAll
 * @property {(id: string) => Promise<SalesOrder|null>} get
 */

/** @param {Transport} ctx @returns {SalesOrdersApi} */
export function buildSalesOrders(ctx) {
  return { ...baseResource(ctx, { path: '/salesorders', listKey: 'salesorders', itemKey: 'salesorder' }) };
}
