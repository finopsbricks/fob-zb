// @ts-check
/**
 * The `customer-payments` resource — payments received. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/CustomerPayment.types.js').CustomerPayment} CustomerPayment
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} CustomerPaymentsApi
 * @property {(params?: object) => Promise<{ data: CustomerPayment[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<CustomerPayment[]>} getAll
 * @property {(id: string) => Promise<CustomerPayment|null>} get
 */

/** @param {Transport} ctx @returns {CustomerPaymentsApi} */
export function buildCustomerPayments(ctx) {
  return { ...baseResource(ctx, { path: '/customerpayments', listKey: 'customerpayments', itemKey: 'payment' }) };
}
