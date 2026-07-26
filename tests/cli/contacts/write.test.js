import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const contacts = { create: jest.fn(), update: jest.fn(), delete: jest.fn(), markInactive: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ contacts })),
}));

const { createContactHandler } = await import('../../../src/cli/contacts/create.js');
const { editContactHandler } = await import('../../../src/cli/contacts/edit.js');
const { deleteContactHandler } = await import('../../../src/cli/contacts/delete.js');

describe('contact write handlers', () => {
  let out;
  beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
  afterEach(() => out.restore());

  it('create maps flags to a Zoho body incl. contact_persons for email/phone', async () => {
    contacts.create.mockResolvedValue({ contact_id: 'C1', contact_name: 'Acme', contact_type: 'customer' });
    await createContactHandler({ name: 'Acme', company: 'Acme Ltd', type: 'customer', email: 'a@b.co', phone: '5551234' });
    expect(contacts.create).toHaveBeenCalledWith({
      contact_name: 'Acme',
      company_name: 'Acme Ltd',
      contact_type: 'customer',
      contact_persons: [{ email: 'a@b.co', phone: '5551234', is_primary_contact: true }],
    });
    expect(out.stdout).toContain('Created contact C1');
  });

  it('edit sends only the passed fields', async () => {
    contacts.update.mockResolvedValue({ contact_id: 'C1', contact_name: 'Acme' });
    await editContactHandler({ id: 'C1', notes: 'hi' });
    expect(contacts.update).toHaveBeenCalledWith('C1', { notes: 'hi' });
  });

  it('edit with no fields throws', async () => {
    await expect(editContactHandler({ id: 'C1' })).rejects.toThrow(/Nothing to update/);
    expect(contacts.update).not.toHaveBeenCalled();
  });

  it('delete refuses without --yes and calls the API with it', async () => {
    await expect(deleteContactHandler({ id: 'C1' })).rejects.toThrow(/--yes/);
    expect(contacts.delete).not.toHaveBeenCalled();

    contacts.delete.mockResolvedValue({});
    await deleteContactHandler({ id: 'C1', yes: true });
    expect(contacts.delete).toHaveBeenCalledWith('C1');
    expect(out.stdout).toContain('Deleted contact C1');
  });
});
