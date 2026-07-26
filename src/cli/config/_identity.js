/**
 * Best-effort resolution of a profile's Zoho organization identity, cached as
 * non-secret metadata so `profiles list` is self-describing. Never throws — a
 * failed fetch must not block saving credentials (a network round-trip is not a
 * precondition for storing a key).
 */

import { getProfile, setProfileIdentity, updateProfileTokens } from '../config-store.js';
import { fobZb } from '../../index.js';

/**
 * Refresh cached org identity for a profile.
 *  - If organization_id is known, fetch that org's name.
 *  - If not, list orgs and adopt the id when exactly one is accessible.
 * @returns {Promise<boolean>} true if any identity metadata was resolved.
 */
export async function refreshIdentity(name) {
  let p;
  try {
    p = getProfile(name);
  } catch {
    return false;
  }
  if (!p.client_id || !p.client_secret || !p.refresh_token) return false;

  const zb = fobZb({ ...p, persistToken: (tok) => updateProfileTokens(name, tok) });

  try {
    if (p.organization_id) {
      const org = await zb.organizations.get(p.organization_id);
      if (org?.name) {
        setProfileIdentity(name, { organization_name: org.name });
        return true;
      }
      return false;
    }

    const { data } = await zb.organizations.list();
    if (data.length === 1) {
      setProfileIdentity(name, {
        organization_id: data[0].organization_id,
        organization_name: data[0].name,
      });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
