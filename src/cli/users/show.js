// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField } from '../utils/format.js';

export async function showUserHandler(argv) {
  const zb = clientFor();
  const u = await zb.users.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(u, null, 2));
    return;
  }
  if (!u) {
    console.error(`No user found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', u.user_id, w));
  console.log(formatField('Name', u.name, w));
  console.log(formatField('Email', u.email, w));
  console.log(formatField('Role', u.role_name, w));
  console.log(formatField('Status', u.status, w));
  console.log(formatField('User Role', u.user_role, w));
}
