// @ts-check
/**
 * Shared write-handler factory. The create/edit/delete/activate/deactivate flow
 * is identical across resources — only the client namespace, the id/label, and
 * the argv→body mapping differ. Each resource supplies those; this returns the
 * handlers. (Contacts predates this and keeps bespoke handlers as the reference.)
 */

import { clientFor } from '../_helpers.js';

/**
 * @param {object} spec
 * @param {string} spec.namespace   Client namespace, e.g. 'items' → zb.items
 * @param {string} spec.label       Human label, e.g. 'item'
 * @param {string} spec.idField     Created-record id field, e.g. 'item_id'
 * @param {(argv: object) => object} spec.buildBody  argv → Zoho body (only passed fields)
 * @param {boolean} [spec.hasStatus]  Whether the resource has active/inactive actions
 */
export function makeWriteHandlers({ namespace, label, idField, buildBody }) {
  return {
    create: async (argv) => {
      const rec = await clientFor()[namespace].create(buildBody(argv));
      if (argv.json) {
        console.log(JSON.stringify(rec, null, 2));
        return;
      }
      console.log(`Created ${label} ${rec?.[idField] ?? ''}.`);
    },

    edit: async (argv) => {
      const body = buildBody(argv);
      if (Object.keys(body).length === 0) {
        throw new Error('Nothing to update — pass at least one field flag.');
      }
      const rec = await clientFor()[namespace].update(argv.id, body);
      if (argv.json) {
        console.log(JSON.stringify(rec, null, 2));
        return;
      }
      console.log(`Updated ${label} ${argv.id}.`);
    },

    remove: async (argv) => {
      if (!argv.yes) {
        throw new Error(`Refusing to delete ${label} ${argv.id} without --yes (this is destructive).`);
      }
      await clientFor()[namespace].delete(argv.id);
      console.log(`Deleted ${label} ${argv.id}.`);
    },

    activate: async (argv) => {
      await clientFor()[namespace].markActive(argv.id);
      console.log(`Activated ${label} ${argv.id}.`);
    },

    deactivate: async (argv) => {
      await clientFor()[namespace].markInactive(argv.id);
      console.log(`Deactivated ${label} ${argv.id}.`);
    },
  };
}
