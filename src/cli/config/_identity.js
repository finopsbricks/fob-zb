/**
 * Best-effort resolution of a profile's Zoho organization identity, cached as
 * non-secret metadata so `profiles list` is self-describing. Never throws — a
 * failed fetch must not block saving credentials (a network round-trip is not a
 * precondition for storing a key).
 */

import { createInterface } from 'node:readline';
import { getProfile, setProfileIdentity, updateProfileTokens } from '../config-store.js';
import { fobZb } from '../../index.js';
import { formatTable } from '../utils/format.js';

/**
 * @typedef {{ organization_id: string, name?: string, currency_code?: string, country?: string, is_default_org?: boolean }} Org
 * @typedef {{ resolved: boolean, orgs?: Org[] }} IdentityResult
 *   `orgs` is set when the login sees several orgs and none is chosen yet.
 */

/**
 * Refresh cached org identity for a profile.
 *  - If organization_id is known, fetch that org's name.
 *  - If not, list orgs and adopt the id when exactly one is accessible; when
 *    several are, return them so the caller can let the user pick.
 * @returns {Promise<IdentityResult>}
 */
export async function refreshIdentity(name) {
  let p;
  try {
    p = getProfile(name);
  } catch {
    return { resolved: false };
  }
  if (!p.client_id || !p.client_secret || !p.refresh_token) return { resolved: false };

  const zb = fobZb({ ...p, persistToken: (tok) => updateProfileTokens(name, tok) });

  try {
    if (p.organization_id) {
      const org = await zb.organizations.get(p.organization_id);
      if (org?.name) {
        setProfileIdentity(name, { organization_name: org.name });
        return { resolved: true };
      }
      return { resolved: false };
    }

    const { data } = await zb.organizations.list();
    if (data.length === 1) {
      adoptOrganization(name, data[0]);
      return { resolved: true };
    }
    return { resolved: false, orgs: data.length > 1 ? data : undefined };
  } catch {
    return { resolved: false };
  }
}

/** Save `org` as the profile's organization. */
export function adoptOrganization(name, org) {
  setProfileIdentity(name, {
    organization_id: String(org.organization_id),
    organization_name: org.name,
  });
}

/** Numbered org table, one row per org, for the picker and the non-interactive hint. */
export function formatOrgChoices(orgs) {
  return formatTable(
    ['#', 'ORG ID', 'NAME', 'CCY', 'COUNTRY', 'DEFAULT'],
    orgs.map((o, i) => [
      String(i + 1),
      String(o.organization_id ?? ''),
      o.name ?? '',
      o.currency_code ?? '',
      o.country ?? '',
      o.is_default_org ? 'yes' : '',
    ]),
  );
}

/** True when a human is at the keyboard (agents and pipes get a printed hint instead). */
export function canPrompt() {
  return Boolean(process.stdin.isTTY && process.stderr.isTTY);
}

/**
 * Ask the user to pick one of `orgs` by number (Enter = Zoho's default org).
 * Prompts on stderr so stdout stays clean. Resolves null if input is closed
 * (Ctrl+D / Ctrl+C) before a valid answer.
 * @param {Org[]} orgs
 * @returns {Promise<Org | null>}
 */
export function promptForOrganization(orgs, { input = process.stdin, output = process.stderr } = {}) {
  const defaultIdx = orgs.findIndex((o) => o.is_default_org);
  const hint = defaultIdx >= 0 ? `1-${orgs.length}, Enter for ${defaultIdx + 1}` : `1-${orgs.length}`;
  const rl = createInterface({ input, output });

  output.write(`This Zoho login can see ${orgs.length} organizations:\n\n${formatOrgChoices(orgs)}\n\n`);

  return new Promise((resolve) => {
    let done = false;
    const finish = (org) => {
      if (done) return;
      done = true;
      rl.close();
      resolve(org);
    };
    rl.on('close', () => finish(null));
    rl.on('SIGINT', () => finish(null));

    const ask = () =>
      rl.question(`Which organization should this profile use? [${hint}]: `, (answer) => {
        const a = answer.trim();
        if (a === '' && defaultIdx >= 0) return finish(orgs[defaultIdx]);
        const n = Number(a);
        if (Number.isInteger(n) && n >= 1 && n <= orgs.length) return finish(orgs[n - 1]);
        const byId = orgs.find((o) => String(o.organization_id) === a);
        if (byId) return finish(byId);
        output.write(`Enter a number from 1 to ${orgs.length}.\n`);
        ask();
      });
    ask();
  });
}

/**
 * After credentials are saved but the org is ambiguous: let a human pick, or
 * print the choices and the exact follow-up command. Credentials are already
 * stored, so the follow-up never needs a new grant code.
 * @returns {Promise<Org | null>} the adopted org, or null if none was chosen
 */
export async function chooseOrganization(name, orgs) {
  if (canPrompt()) {
    const org = await promptForOrganization(orgs);
    if (org) {
      adoptOrganization(name, org);
      return org;
    }
    console.error('\nNo organization selected.');
  } else {
    console.error(`This Zoho login can see ${orgs.length} organizations:\n\n${formatOrgChoices(orgs)}\n`);
  }
  console.error(
    `Credentials are saved — no new grant code needed. Pick one with:\n` +
      `  fob-zb config profiles add ${name} --organization-id <ORG ID>`,
  );
  return null;
}
