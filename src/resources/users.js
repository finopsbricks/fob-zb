// @ts-check
/**
 * The `users` resource — organization users. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/User.types.js').User} User
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} UsersApi
 * @property {(params?: object) => Promise<{ data: User[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<User[]>} getAll
 * @property {(id: string) => Promise<User|null>} get
 */

/** @param {Transport} ctx @returns {UsersApi} */
export function buildUsers(ctx) {
  return { ...baseResource(ctx, { path: '/users', listKey: 'users', itemKey: 'user' }) };
}
