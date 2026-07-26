// @ts-check
/**
 * The `vendor-payments` resource — payments made to vendors. This is how a bill
 * payment is recorded (there is no pay action under /bills).
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/VendorPayment.types.js').VendorPayment} VendorPayment
 */
import { baseResource, writeResource } from './_base.js';

/**
 * @typedef {Object} VendorPaymentsApi
 * @property {(params?: object) => Promise<{ data: VendorPayment[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<VendorPayment[]>} getAll
 * @property {(id: string) => Promise<VendorPayment|null>} get
 * @property {(body: object) => Promise<VendorPayment|null>} create
 * @property {(id: string, body: object) => Promise<VendorPayment|null>} update
 * @property {(id: string) => Promise<any>} delete
 */

const P = '/vendorpayments';

/** @param {Transport} ctx @returns {VendorPaymentsApi} */
export function buildVendorPayments(ctx) {
  return {
    ...baseResource(ctx, { path: P, listKey: 'vendorpayments', itemKey: 'vendorpayment' }),
    ...writeResource(ctx, { path: P, itemKey: 'vendorpayment' }),
  };
}
