import { jest } from '@jest/globals';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Point the store at a throwaway dir and clear any ambient env creds BEFORE import
// (config-store resolves its config path at module load).
const dir = mkdtempSync(join(tmpdir(), 'fob-zb-cfg-'));
process.env.FOB_ZB_CONFIG_DIR = dir;
for (const k of ['FOB_ZB_CLIENT_ID', 'FOB_ZB_CLIENT_SECRET', 'FOB_ZB_REFRESH_TOKEN', 'FOB_ZB_ORGANIZATION_ID', 'FOB_ZB_REGION']) {
  delete process.env[k];
}

const store = await import('../src/cli/config-store.js');

const creds = { client_id: 'cid', client_secret: 'sec', refresh_token: 'rt', organization_id: 'ORG1' };

afterEach(() => {
  store.setProfileOverride(null);
  for (const k of ['FOB_ZB_CLIENT_ID', 'FOB_ZB_CLIENT_SECRET', 'FOB_ZB_REFRESH_TOKEN', 'FOB_ZB_ORGANIZATION_ID']) {
    delete process.env[k];
  }
});

it('adds a profile, makes it current, and resolves it', () => {
  store.addProfile('acme', creds);
  const r = store.resolveCredentials();
  expect(r.name).toBe('acme');
  expect(r.client_id).toBe('cid');
  expect(r.region).toBe('com');
  expect(r.source).toContain("profile 'acme'");
});

it('env (full set) beats the current profile', () => {
  store.addProfile('acme', creds);
  process.env.FOB_ZB_CLIENT_ID = 'ecid';
  process.env.FOB_ZB_CLIENT_SECRET = 'esec';
  process.env.FOB_ZB_REFRESH_TOKEN = 'ert';
  process.env.FOB_ZB_ORGANIZATION_ID = 'EORG';
  const r = store.resolveCredentials();
  expect(r.source).toBe('FOB_ZB_* env');
  expect(r.client_id).toBe('ecid');
  expect(r.name).toBeNull();
});

it('a partial env set does NOT override the profile', () => {
  store.addProfile('acme', creds);
  process.env.FOB_ZB_CLIENT_ID = 'ecid'; // only one of four
  const r = store.resolveCredentials();
  expect(r.source).toContain("profile 'acme'");
});

it('--profile override beats env and current', () => {
  store.addProfile('acme', creds);
  store.addProfile('other', { ...creds, client_id: 'other-cid' });
  process.env.FOB_ZB_CLIENT_ID = 'ecid';
  process.env.FOB_ZB_CLIENT_SECRET = 'esec';
  process.env.FOB_ZB_REFRESH_TOKEN = 'ert';
  process.env.FOB_ZB_ORGANIZATION_ID = 'EORG';
  store.setProfileOverride('other');
  const r = store.resolveCredentials();
  expect(r.name).toBe('other');
  expect(r.client_id).toBe('other-cid');
});

it('persists refreshed tokens onto the profile', () => {
  store.addProfile('acme', creds);
  store.updateProfileTokens('acme', {
    access_token: 'AT',
    access_token_expires_at: '2026-07-26T15:00:00Z',
    api_domain: 'https://www.zohoapis.eu',
  });
  const p = store.getProfile('acme');
  expect(p.access_token).toBe('AT');
  expect(p.api_domain).toBe('https://www.zohoapis.eu');
});

it('listProfiles never leaks secrets', () => {
  store.addProfile('acme', creds);
  const { profiles } = store.listProfiles();
  const row = profiles.find((p) => p.name === 'acme');
  expect(row.has_refresh_token).toBe(true);
  expect(row).not.toHaveProperty('client_secret');
  expect(row).not.toHaveProperty('refresh_token');
});
