import { jest } from '@jest/globals';
import { createTransport } from '../src/http.js';

function res(body, { status = 200, headers = {} } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'x',
    headers: { get: (k) => headers[k.toLowerCase()] ?? null },
    text: async () => (body == null ? '' : JSON.stringify(body)),
  };
}

const baseCreds = {
  client_id: 'cid',
  client_secret: 'sec',
  refresh_token: 'rt',
  organization_id: 'ORG1',
  region: 'com',
};

const freshToken = { access_token: 'CACHED', access_token_expires_at: new Date(Date.now() + 3600e3).toISOString() };

afterEach(() => jest.restoreAllMocks());

it('refreshes the token, then sends Zoho-oauthtoken + organization_id under /books/v3', async () => {
  const calls = [];
  global.fetch = jest.fn(async (url, init) => {
    const u = url.toString();
    calls.push({ u, init });
    if (u.includes('/oauth/v2/token')) return res({ access_token: 'AT1', expires_in: 3600 });
    return res({ code: 0, organizations: [{ organization_id: 'ORG1', name: 'Acme' }] });
  });

  const ctx = createTransport(baseCreds);
  const r = await ctx.get('/organizations');

  expect(r.organizations[0].name).toBe('Acme');
  const tokenCall = calls.find((c) => c.u.includes('/oauth/v2/token'));
  expect(tokenCall.u).toContain('accounts.zoho.com');
  const apiCall = calls.find((c) => c.u.includes('/books/v3/organizations'));
  expect(apiCall.u).toContain('www.zohoapis.com/books/v3/organizations');
  expect(apiCall.u).toContain('organization_id=ORG1');
  expect(apiCall.init.headers.authorization).toBe('Zoho-oauthtoken AT1');
});

it('reuses a cached, unexpired access token without hitting the token endpoint', async () => {
  global.fetch = jest.fn(async () => res({ code: 0, users: [] }));
  const ctx = createTransport({ ...baseCreds, ...freshToken });
  await ctx.get('/users');
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch.mock.calls[0][1].headers.authorization).toBe('Zoho-oauthtoken CACHED');
});

it('throws ApiError on a non-zero Zoho code (HTTP 200)', async () => {
  global.fetch = jest.fn(async (url) =>
    url.toString().includes('/oauth/v2/token')
      ? res({ access_token: 'AT', expires_in: 3600 })
      : res({ code: 1002, message: 'Invoice does not exist' }),
  );
  const ctx = createTransport(baseCreds);
  await expect(ctx.get('/invoices/x')).rejects.toMatchObject({
    name: 'ApiError',
    code: 1002,
    message: 'Invoice does not exist',
  });
});

it('force-refreshes and retries once on a 401', async () => {
  let apiHits = 0;
  global.fetch = jest.fn(async (url) => {
    if (url.toString().includes('/oauth/v2/token')) return res({ access_token: 'NEW', expires_in: 3600 });
    apiHits += 1;
    return apiHits === 1 ? res(null, { status: 401 }) : res({ code: 0 });
  });
  const ctx = createTransport({ ...baseCreds, ...freshToken });
  await ctx.get('/x');
  expect(apiHits).toBe(2);
});

it('calls persistToken with the new token + detected api_domain on refresh', async () => {
  const persisted = [];
  global.fetch = jest.fn(async (url) =>
    url.toString().includes('/oauth/v2/token')
      ? res({ access_token: 'AT9', expires_in: 3600, api_domain: 'https://www.zohoapis.eu' })
      : res({ code: 0 }),
  );
  const ctx = createTransport({ ...baseCreds, persistToken: (t) => persisted.push(t) });
  await ctx.get('/x');
  expect(persisted).toHaveLength(1);
  expect(persisted[0].access_token).toBe('AT9');
  expect(persisted[0].api_domain).toBe('https://www.zohoapis.eu');
});

it('getAll walks page_context.has_more_page', async () => {
  const pages = {
    1: { code: 0, invoices: [{ id: 1 }], page_context: { page: 1, has_more_page: true } },
    2: { code: 0, invoices: [{ id: 2 }], page_context: { page: 2, has_more_page: false } },
  };
  global.fetch = jest.fn(async (url) => {
    const u = new URL(url.toString());
    if (u.pathname.includes('/oauth/v2/token')) return res({ access_token: 'AT', expires_in: 3600 });
    return res(pages[u.searchParams.get('page')]);
  });
  const ctx = createTransport(baseCreds);
  const out = await ctx.getAll('/invoices', { key: 'invoices' });
  expect(out.data.map((i) => i.id)).toEqual([1, 2]);
  expect(out.truncated).toBe(false);
});

it('upload sends one file as multipart/form-data with organization_id, and retries once on a 401', async () => {
  const sent = [];
  global.fetch = jest.fn(async (url, init) => {
    if (url.toString().includes('/oauth/v2/token')) return res({ access_token: 'NEW', expires_in: 3600 });
    sent.push({ u: url.toString(), init });
    return sent.length === 1 ? res(null, { status: 401 }) : res({ code: 0, message: 'The document has been attached.' });
  });
  const ctx = createTransport({ ...baseCreds, ...freshToken });
  const r = await ctx.upload('/bills/B1/attachment', {
    field: 'attachment', filename: 'inv.pdf', data: Buffer.from('%PDF-1.4 x'), contentType: 'application/pdf',
  });

  expect(r.message).toMatch(/attached/);
  expect(sent).toHaveLength(2);
  const { u, init } = sent[1];
  expect(u).toContain('/books/v3/bills/B1/attachment');
  expect(u).toContain('organization_id=ORG1');
  expect(init.method).toBe('POST');
  expect(init.headers['content-type']).toBeUndefined(); // fetch adds the multipart boundary
  expect(init.headers.authorization).toBe('Zoho-oauthtoken NEW');
  const file = init.body.get('attachment');
  expect(file.name).toBe('inv.pdf');
  expect(file.type).toBe('application/pdf');
  expect(await file.text()).toBe('%PDF-1.4 x');
});
