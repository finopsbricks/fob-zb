import { removeProfile } from '../config-store.js';

export async function removeConfigHandler(argv) {
  removeProfile(argv.name);
  console.log(`Removed profile '${argv.name}'.`);
}
