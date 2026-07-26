// @ts-check
/**
 * The `projects` resource — projects. Read methods for now.
 * @typedef {import('../types/general/index.js').Transport} Transport
 * @typedef {import('../types/api/Project.types.js').Project} Project
 */
import { baseResource } from './_base.js';

/**
 * @typedef {Object} ProjectsApi
 * @property {(params?: object) => Promise<{ data: Project[], page_context: object|null }>} list
 * @property {(params?: object) => Promise<Project[]>} getAll
 * @property {(id: string) => Promise<Project|null>} get
 */

/** @param {Transport} ctx @returns {ProjectsApi} */
export function buildProjects(ctx) {
  return { ...baseResource(ctx, { path: '/projects', listKey: 'projects', itemKey: 'project' }) };
}
