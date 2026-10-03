import { listProfiles } from '../config-store.js';
import { refreshIdentity, chooseOrganization } from './_identity.js';

/**
 * Re-sync a profile's cached org identity from the server (`--all` for every
 * profile). Fixes drift in organization_name / api_domain and adopts the org id
 * when a single-org account had none cached — or asks which one when it sees several.
 */
export async function refreshConfigHandler(argv) {
  const names = argv.all
    ? listProfiles().profiles.map((p) => p.name)
    : argv.name
      ? [argv.name]
      : [];

  if (names.length === 0) {
    throw new Error('Specify a profile name, or --all to refresh every profile.');
  }

  for (const name of names) {
    const { resolved, orgs } = await refreshIdentity(name);
    const ok = resolved || (orgs && (await chooseOrganization(name, orgs)));
    console.log(`${name}: ${ok ? 'refreshed' : 'no change (could not resolve identity)'}`);
  }
}
