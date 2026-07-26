import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const contactPersons = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ contactPersons })),
}));

const { listContactPersonsHandler } = await import('../../../src/cli/contact-persons/list.js');

describe('listContactPersonsHandler', () => {
  let out;
  beforeEach(() => {
    jest.clearAllMocks();
    out = captureOutput();
  });
  afterEach(() => out.restore());

  it('renders a table of contact persons', async () => {
    contactPersons.list.mockResolvedValue({
      data: [{ contact_person_id: '8927', first_name: 'Jane', last_name: 'Doe', email: 'jane@acme.com', phone: '555-1234', is_primary_contact: true }],
    });
    await listContactPersonsHandler({});
    expect(out.stdout).toContain('Jane');
    expect(out.stdout).toContain('8927');
  });

  it('emits raw JSON under --json', async () => {
    contactPersons.getAll.mockResolvedValue([{ contact_person_id: '1', first_name: 'Jane' }]);
    await listContactPersonsHandler({ json: true });
    expect(out.stdout).toContain('"first_name": "Jane"');
  });

  it('prints (no contact persons) when empty', async () => {
    contactPersons.list.mockResolvedValue({ data: [] });
    await listContactPersonsHandler({});
    expect(out.stdout).toContain('(no contact persons)');
  });
});
