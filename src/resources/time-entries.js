// @ts-check
/**
 * The `time-entries` resource — project time entries. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/TimeEntry.types.js').TimeEntry} TimeEntry
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} TimeEntriesApi
 * @property {(params?: object) => Promise<{ data: TimeEntry[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<TimeEntry[]>} getAll
 * @property {(id: string) => Promise<TimeEntry|null>} get
 */

/** @param {Transport} ctx @returns {TimeEntriesApi} */
export function buildTimeEntries(ctx) {
  return { ...baseResource(ctx, { path: '/projects/timeentries', listKey: 'time_entries', itemKey: 'time_entry' }) };
}
