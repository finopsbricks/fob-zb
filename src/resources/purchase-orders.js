// @ts-check
/**
 * The `purchase-orders` resource — purchase orders. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/PurchaseOrder.types.js').PurchaseOrder} PurchaseOrder
 */
import { baseResource, writeResource, documentActions } from './_base.js';

/**
 * @typedef {Object} PurchaseOrdersApi
 * @property {(params?: object) => Promise<{ data: PurchaseOrder[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<PurchaseOrder[]>} getAll
 * @property {(id: string) => Promise<PurchaseOrder|null>} get
 * @property {(body: object) => Promise<PurchaseOrder|null>} create
 * @property {(id: string, body: object) => Promise<PurchaseOrder|null>} update
 * @property {(id: string) => Promise<any>} delete
 * @property {(id: string, state: string) => Promise<any>} status
 * @property {(id: string) => Promise<any>} submit
 * @property {(id: string) => Promise<any>} approve
 * @property {(id: string, body?: object) => Promise<any>} email
 */

const P = '/purchaseorders';

/** @param {Transport} ctx @returns {PurchaseOrdersApi} */
export function buildPurchaseOrders(ctx) {
  return {
    ...baseResource(ctx, { path: P, listKey: 'purchaseorders', itemKey: 'purchaseorder' }),
    ...writeResource(ctx, { path: P, itemKey: 'purchaseorder' }),
    ...documentActions(ctx, P),
  };
}
