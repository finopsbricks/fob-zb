import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const users = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ users })),
}));

const { listUsersHandler } = await import('../../../src/cli/users/list.js');

describe('listUsersHandler', () => {
  let out;
  beforeEach(() => {
    jest.clearAllMocks();
    out = captureOutput();
  });
  afterEach(() => out.restore());

  it('renders a table of users', async () => {
    users.list.mockResolvedValue({
      data: [{ user_id: '8927', name: 'Jane Doe', email: 'jane@acme.com', role_name: 'Admin', status: 'active' }],
    });
    await listUsersHandler({});
    expect(out.stdout).toContain('Jane Doe');
    expect(out.stdout).toContain('8927');
  });

  it('emits raw JSON under --json', async () => {
    users.getAll.mockResolvedValue([{ user_id: '1', name: 'Jane' }]);
    await listUsersHandler({ json: true });
    expect(out.stdout).toContain('"name": "Jane"');
  });

  it('prints (no users) when empty', async () => {
    users.list.mockResolvedValue({ data: [] });
    await listUsersHandler({});
    expect(out.stdout).toContain('(no users)');
  });
});
