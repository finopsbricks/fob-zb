// @ts-check
import { clientFor } from '../_helpers.js';

export async function activateContactHandler(argv) {
  const zb = clientFor();
  await zb.contacts.markActive(argv.id);
  console.log(`Activated contact ${argv.id}.`);
}

export async function deactivateContactHandler(argv) {
  const zb = clientFor();
  await zb.contacts.markInactive(argv.id);
  console.log(`Deactivated contact ${argv.id}.`);
}
