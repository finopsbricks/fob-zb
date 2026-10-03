import { jest } from '@jest/globals';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
