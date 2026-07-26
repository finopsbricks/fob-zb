// @ts-check
/**
 * The `estimates` resource — quotes/estimates. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Estimate.types.js').Estimate} Estimate
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} EstimatesApi
 * @property {(params?: object) => Promise<{ data: Estimate[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Estimate[]>} getAll
 * @property {(id: string) => Promise<Estimate|null>} get
 */

/** @param {Transport} ctx @returns {EstimatesApi} */
export function buildEstimates(ctx) {
  return { ...baseResource(ctx, { path: '/estimates', listKey: 'estimates', itemKey: 'estimate' }) };
}
