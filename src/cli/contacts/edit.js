// @ts-check
import { clientFor } from '../_helpers.js';
import { buildContactBody } from './_body.js';

export async function editContactHandler(argv) {
  const body = buildContactBody(argv);
  if (Object.keys(body).length === 0) {
    throw new Error('Nothing to update — pass at least one field flag (e.g. --name, --company, --email).');
  }

  const zb = clientFor();
  const contact = await zb.contacts.update(argv.id, body);

  if (argv.json) {
    console.log(JSON.stringify(contact, null, 2));
    return;
  }
  console.log(`Updated contact ${contact.contact_id} — ${contact.contact_name}.`);
}
