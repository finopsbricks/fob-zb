// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField } from '../utils/format.js';

export async function showContactPersonHandler(argv) {
  const zb = clientFor();
  const c = await zb.contactPersons.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(c, null, 2));
    return;
  }
  if (!c) {
    console.error(`No contact person found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', c.contact_person_id, w));
  console.log(formatField('First Name', c.first_name, w));
  console.log(formatField('Last Name', c.last_name, w));
  console.log(formatField('Email', c.email, w));
  console.log(formatField('Phone', c.phone, w));
  console.log(formatField('Mobile', c.mobile, w));
  console.log(formatField('Primary', c.is_primary_contact ? 'yes' : 'no', w));
  console.log(formatField('Contact ID', c.contact_id, w));
}
