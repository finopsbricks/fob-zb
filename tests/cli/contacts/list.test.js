import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const contacts = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ contacts })),
}));

const { listContactsHandler } = await import('../../../src/cli/contacts/list.js');

describe('listContactsHandler', () => {
  let out;
  beforeEach(() => {
    jest.clearAllMocks();
    out = captureOutput();
  });
  afterEach(() => out.restore());

  it('renders a table and maps --type to filter_by=Status.Customers', async () => {
    contacts.list.mockResolvedValue({
      data: [{ contact_id: '1', contact_name: 'Acme', contact_type: 'customer', status: 'active' }],
      page_context: { has_more_page: false },
    });
    await listContactsHandler({ type: 'customer', page: 1, perPage: 200 });
    expect(contacts.list).toHaveBeenCalledWith(expect.objectContaining({ filter_by: 'Status.Customers' }));
    expect(out.stdout).toContain('Acme');
  });

  it('rejects --type together with --status', async () => {
    await expect(listContactsHandler({ type: 'customer', status: 'active' })).rejects.toThrow(/single filter dimension/);
  });

  it('auto-paginates for --json via getAll', async () => {
    contacts.getAll.mockResolvedValue([{ contact_id: '1', contact_name: 'Acme' }]);
    await listContactsHandler({ json: true });
    expect(contacts.getAll).toHaveBeenCalled();
    expect(out.stdout).toContain('"contact_name": "Acme"');
  });
});
