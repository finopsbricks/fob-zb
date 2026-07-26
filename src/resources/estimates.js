// @ts-check
/**
 * The `estimates` resource — quotes/estimates, with write + status actions.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Estimate.types.js').Estimate} Estimate
 */
import { baseResource, writeResource, documentActions } from './_base.js';

/**
 * @typedef {Object} EstimatesApi
 * @property {(params?: object) => Promise<{ data: Estimate[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Estimate[]>} getAll
 * @property {(id: string) => Promise<Estimate|null>} get
 * @property {(body: object) => Promise<Estimate|null>} create
 * @property {(id: string, body: object) => Promise<Estimate|null>} update
 * @property {(id: string) => Promise<any>} delete
 * @property {(id: string, state: string) => Promise<any>} status
 * @property {(id: string) => Promise<any>} submit
 * @property {(id: string) => Promise<any>} approve
 * @property {(id: string, body?: object) => Promise<any>} email
 */

const P = '/estimates';

/** @param {Transport} ctx @returns {EstimatesApi} */
export function buildEstimates(ctx) {
  return {
    ...baseResource(ctx, { path: P, listKey: 'estimates', itemKey: 'estimate' }),
    ...writeResource(ctx, { path: P, itemKey: 'estimate' }),
    ...documentActions(ctx, P),
  };
}
