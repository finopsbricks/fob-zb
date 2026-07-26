import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const organizations = { list: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ organizations })),
}));

const { listOrganizationsHandler } = await import('../../../src/cli/organizations/list.js');

describe('listOrganizationsHandler', () => {
  let out;
  beforeEach(() => {
    jest.clearAllMocks();
    out = captureOutput();
  });
  afterEach(() => out.restore());

  it('renders a table of organizations', async () => {
    organizations.list.mockResolvedValue({
      data: [{ organization_id: '8927', name: 'Acme Inc', currency_code: 'USD', country: 'U.S.A', is_default_org: true }],
    });
    await listOrganizationsHandler({});
    expect(out.stdout).toContain('Acme Inc');
    expect(out.stdout).toContain('8927');
  });

  it('emits raw JSON under --json', async () => {
    organizations.list.mockResolvedValue({ data: [{ organization_id: '1', name: 'Acme' }] });
    await listOrganizationsHandler({ json: true });
    expect(out.stdout).toContain('"name": "Acme"');
  });

  it('prints (no organizations) when empty', async () => {
    organizations.list.mockResolvedValue({ data: [] });
    await listOrganizationsHandler({});
    expect(out.stdout).toContain('(no organizations)');
  });
});
