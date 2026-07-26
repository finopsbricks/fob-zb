// @ts-check
/**
 * The `journals` resource — manual journal entries. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Journal.types.js').Journal} Journal
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} JournalsApi
 * @property {(params?: object) => Promise<{ data: Journal[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Journal[]>} getAll
 * @property {(id: string) => Promise<Journal|null>} get
 */

/** @param {Transport} ctx @returns {JournalsApi} */
export function buildJournals(ctx) {
  return { ...baseResource(ctx, { path: '/journals', listKey: 'journals', itemKey: 'journal' }) };
}
