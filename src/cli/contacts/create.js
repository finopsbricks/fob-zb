// @ts-check
import { clientFor } from '../_helpers.js';
import { buildContactBody } from './_body.js';

export async function createContactHandler(argv) {
  const zb = clientFor();
  const contact = await zb.contacts.create(buildContactBody(argv));

  if (argv.json) {
    console.log(JSON.stringify(contact, null, 2));
    return;
  }
  console.log(`Created contact ${contact.contact_id} — ${contact.contact_name} (${contact.contact_type ?? 'customer'}).`);
}
