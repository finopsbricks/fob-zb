// @ts-check
import { clientFor } from '../_helpers.js';

export async function deleteContactHandler(argv) {
  if (!argv.yes) {
    throw new Error(`Refusing to delete contact ${argv.id} without --yes (this is destructive).`);
  }
  const zb = clientFor();
  await zb.contacts.delete(argv.id);
  console.log(`Deleted contact ${argv.id}.`);
}
