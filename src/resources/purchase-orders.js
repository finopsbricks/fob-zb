// @ts-check
/**
 * The `purchase-orders` resource — purchase orders. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/PurchaseOrder.types.js').PurchaseOrder} PurchaseOrder
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} PurchaseOrdersApi
 * @property {(params?: object) => Promise<{ data: PurchaseOrder[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<PurchaseOrder[]>} getAll
 * @property {(id: string) => Promise<PurchaseOrder|null>} get
 */

/** @param {Transport} ctx @returns {PurchaseOrdersApi} */
export function buildPurchaseOrders(ctx) {
  return { ...baseResource(ctx, { path: '/purchaseorders', listKey: 'purchaseorders', itemKey: 'purchaseorder' }) };
}
