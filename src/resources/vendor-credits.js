// @ts-check
/**
 * The `vendor-credits` resource — vendor credits. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/VendorCredit.types.js').VendorCredit} VendorCredit
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} VendorCreditsApi
 * @property {(params?: object) => Promise<{ data: VendorCredit[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<VendorCredit[]>} getAll
 * @property {(id: string) => Promise<VendorCredit|null>} get
 */

/** @param {Transport} ctx @returns {VendorCreditsApi} */
export function buildVendorCredits(ctx) {
  return { ...baseResource(ctx, { path: '/vendorcredits', listKey: 'vendor_credits', itemKey: 'vendor_credit' }) };
}
