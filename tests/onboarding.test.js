import { jest } from '@jest/globals';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import { captureOutput } from './helpers.js';

// Throwaway config dir + no ambient env creds BEFORE import (the store resolves
// its path at module load).
const dir = mkdtempSync(join(tmpdir(), 'fob-zb-onboard-'));
process.env.FOB_ZB_CONFIG_DIR = dir;
for (const k of ['FOB_ZB_CLIENT_ID', 'FOB_ZB_CLIENT_SECRET', 'FOB_ZB_REFRESH_TOKEN', 'FOB_ZB_ORGANIZATION_ID', 'FOB_ZB_REGION']) {
  delete process.env[k];
}

const store = await import('../src/cli/config-store.js');
const { gettingStartedHandler } = await import('../src/cli/getting-started.js');
const { addConfigHandler } = await import('../src/cli/config/add.js');
const { promptForOrganization } = await import('../src/cli/config/_identity.js');
const { apiConsoleUrl, exchangeGrantCode } = await import('../src/oauth.js');
const { TROUBLESHOOTING_DOCS_URL } = await import('../src/links.js');

let out;
beforeEach(() => {
  rmSync(join(dir, 'config.yml'), { force: true });
  out = captureOutput();
  // refreshIdentity() calls Zoho after a save; fail it so tests stay offline.
  global.fetch = jest.fn(async () => { throw new Error('offline'); });
});
afterEach(() => {
  out.restore();
  jest.restoreAllMocks();
});

describe('apiConsoleUrl', () => {
  it('maps each region to its own API console', () => {
    expect(apiConsoleUrl('com')).toBe('https://api-console.zoho.com');
    expect(apiConsoleUrl('in')).toBe('https://api-console.zoho.in');
    expect(apiConsoleUrl('ca')).toBe('https://api-console.zohocloud.ca');
    expect(apiConsoleUrl()).toBe('https://api-console.zoho.com');
  });
});

describe('getting-started', () => {
  it('walks through the Self Client setup when nothing is configured', async () => {
    await gettingStartedHandler();
    expect(out.stdout).toContain('No profile is configured yet');
    expect(out.stdout).toContain('https://api-console.zoho.in');
    expect(out.stdout).toContain('ZohoBooks.fullaccess.all');
    expect(out.stdout).toContain('--grant-code');
  });

  it('says setup is done when a profile exists, and shows how to add another org', async () => {
    store.addProfile('acme', { client_id: 'c', client_secret: 's', refresh_token: 'r', organization_name: 'Acme Ltd' });
    await gettingStartedHandler();
    expect(out.stdout).toContain('Setup is already complete');
    expect(out.stdout).toContain('acme (Acme Ltd)');
    expect(out.stdout).toContain('--from <existing-profile>');
  });
});

describe('config profiles add --from', () => {
  it("copies another profile's OAuth credentials but not its organization", async () => {
    store.addProfile('main', {
      region: 'in', client_id: 'c', client_secret: 's', refresh_token: 'r',
      organization_id: 'ORG1', organization_name: 'Main', access_token: 'AT',
    });
    await addConfigHandler({ name: 'second', from: 'main', organizationId: 'ORG2' });

    const p = store.getProfile('second');
    expect(p).toMatchObject({ region: 'in', client_id: 'c', client_secret: 's', refresh_token: 'r', organization_id: 'ORG2' });
    expect(p.organization_name).toBeUndefined();
    expect(p.access_token).toBeUndefined();
  });

  it('rejects copying a profile onto itself', async () => {
    store.addProfile('main', { client_id: 'c', client_secret: 's', refresh_token: 'r' });
    await expect(addConfigHandler({ name: 'main', from: 'main' })).rejects.toThrow(/different profile/);
  });

  it('points at the region-specific API console when credentials are missing', async () => {
    await expect(addConfigHandler({ name: 'new', region: 'eu' })).rejects.toThrow(/api-console\.zoho\.eu/);
  });
});

describe('token errors', () => {
  it('link to the troubleshooting docs', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true, status: 200, statusText: 'OK', headers: { get: () => null },
      text: async () => JSON.stringify({ error: 'invalid_client' }),
    }));
    await expect(exchangeGrantCode({ client_id: 'c', client_secret: 's', code: 'x' }))
      .rejects.toThrow(`${TROUBLESHOOTING_DOCS_URL}#invalid-client`);
  });
});

describe('config profiles add with several organizations', () => {
  const ORGS = [
    { organization_id: '111', name: 'Alpha', currency_code: 'INR', country: 'India', is_default_org: false },
    { organization_id: '222', name: 'Beta', currency_code: 'INR', country: 'India', is_default_org: true },
  ];

  /** Stub Zoho: token endpoint + GET /organizations. */
  const zohoWithOrgs = () =>
    jest.fn(async (url) => ({
      ok: true, status: 200, statusText: 'OK', headers: { get: () => null },
      text: async () => JSON.stringify(
        String(url).includes('/oauth/')
          ? { access_token: 'AT', expires_in: 3600 }
          : { code: 0, organizations: ORGS },
      ),
    }));

  it('without a terminal, prints the org list and the follow-up command', async () => {
    global.fetch = zohoWithOrgs();
    await addConfigHandler({ name: 'multi', clientId: 'c', clientSecret: 's', refreshToken: 'r' });

    expect(out.stderr).toContain('can see 2 organizations');
    expect(out.stderr).toMatch(/111\s+Alpha/);
    expect(out.stderr).toMatch(/222\s+Beta/);
    expect(out.stderr).toContain('no new grant code needed');
    expect(out.stderr).toContain('fob-zb config profiles add multi --organization-id <ORG ID>');
    expect(store.getProfile('multi').organization_id).toBeUndefined();
  });

  const pick = async (answers) => {
    const input = new PassThrough();
    const output = new PassThrough();
    output.resume();
    const p = promptForOrganization(ORGS, { input, output });
    for (const a of answers) input.write(`${a}\n`);
    return p;
  };

  it('picks by number', async () => {
    expect((await pick(['1'])).name).toBe('Alpha');
  });

  it('Enter picks the Zoho default org', async () => {
    expect((await pick([''])).name).toBe('Beta');
  });

  it('accepts an org id and re-asks on bad input', async () => {
    expect((await pick(['9', '111'])).name).toBe('Alpha');
  });

  it('resolves null when input closes', async () => {
    const input = new PassThrough();
    const output = new PassThrough();
    output.resume();
    const p = promptForOrganization(ORGS, { input, output });
    input.end();
    expect(await p).toBeNull();
  });
});
