import { jest } from '@jest/globals';
import {
  regionOf,
  apiBase,
  accountsBase,
  exchangeGrantCode,
  refreshAccessToken,
  OAuthError,
} from '../src/oauth.js';

function res(body, { status = 200 } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'x',
    headers: { get: () => null },
    text: async () => (body == null ? '' : JSON.stringify(body)),
  };
}

afterEach(() => jest.restoreAllMocks());

describe('region routing', () => {
  it('defaults to com and rejects unknown regions', () => {
    expect(accountsBase({})).toBe('https://accounts.zoho.com');
    expect(apiBase({ region: 'eu' })).toBe('https://www.zohoapis.eu');
    expect(accountsBase({ region: 'ca' })).toBe('https://accounts.zohocloud.ca');
    expect(() => regionOf('mars')).toThrow(OAuthError);
  });

  it('prefers an explicit api_domain over the region host', () => {
    expect(apiBase({ region: 'com', api_domain: 'https://custom.zohoapis.com' })).toBe(
      'https://custom.zohoapis.com',
    );
  });
});

describe('token exchange', () => {
  it('exchanges a grant code for a refresh token', async () => {
    global.fetch = jest.fn(async () =>
      res({ refresh_token: 'RT', access_token: 'AT', expires_in: 3600, api_domain: 'https://www.zohoapis.com' }),
    );
    const out = await exchangeGrantCode({ client_id: 'c', client_secret: 's', code: '1000.abc', region: 'com' });
    expect(out.refresh_token).toBe('RT');
    expect(global.fetch.mock.calls[0][0].toString()).toContain('accounts.zoho.com/oauth/v2/token');
  });

  it('maps invalid_code (HTTP 200 with an error body) to a helpful message', async () => {
    global.fetch = jest.fn(async () => res({ error: 'invalid_code' }));
    await expect(exchangeGrantCode({ client_id: 'c', client_secret: 's', code: 'x' })).rejects.toThrow(/single-use/);
  });

  it('refreshes an access token', async () => {
    global.fetch = jest.fn(async () => res({ access_token: 'AT2', expires_in: 3600 }));
    const out = await refreshAccessToken({ client_id: 'c', client_secret: 's', refresh_token: 'rt', region: 'eu' });
    expect(out.access_token).toBe('AT2');
    expect(global.fetch.mock.calls[0][0].toString()).toContain('accounts.zoho.eu/oauth/v2/token');
  });
});
