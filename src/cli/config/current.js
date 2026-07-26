import { describeCurrent } from '../config-store.js';
import { formatField } from '../utils/format.js';

export async function currentConfigHandler(argv) {
  const cur = describeCurrent();

  if (argv.json) {
    console.log(JSON.stringify(cur, null, 2));
    return;
  }

  if (!cur) {
    console.log('(no profile selected — run `fob-zb config profiles add <name>`)');
    return;
  }

  const w = 16;
  console.log(formatField('Source', cur.source, w));
  console.log(formatField('Profile', cur.name ?? '(env)', w));
  console.log(formatField('Region', cur.region, w));
  console.log(formatField('Org ID', cur.organization_id, w));
  console.log(formatField('Organization', cur.organization_name, w));
}
