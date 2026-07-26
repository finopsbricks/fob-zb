import { listProfiles } from '../config-store.js';
import { formatTable } from '../utils/format.js';

export async function listConfigHandler(argv) {
  const { current, path, profiles } = listProfiles();

  if (argv.json) {
    console.log(JSON.stringify({ current, profiles }, null, 2));
    return;
  }

  if (profiles.length === 0) {
    console.log('(no profiles configured — run `fob-zb config profiles add <name>`)');
    return;
  }

  const headers = ['', 'NAME', 'REGION', 'ORG ID', 'ORGANIZATION', 'AUTH'];
  const rows = profiles.map((p) => [
    p.current ? '*' : ' ',
    p.name,
    p.region ?? '',
    p.organization_id ?? '',
    p.organization_name ?? '',
    p.has_refresh_token ? 'ok' : 'missing',
  ]);

  console.log(formatTable(headers, rows));
  console.log(`\n(* = current)  config: ${path}`);
}
