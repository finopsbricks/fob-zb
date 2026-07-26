import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const creditNotes = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ creditNotes })),
}));

const { listCreditNotesHandler } = await import('../../../src/cli/credit-notes/list.js');

describe('listCreditNotesHandler', () => {
  let out;
  beforeEach(() => {
    jest.clearAllMocks();
    out = captureOutput();
  });
  afterEach(() => out.restore());

  it('maps --status to filter_by and renders a table', async () => {
    creditNotes.list.mockResolvedValue({
      data: [{ creditnote_id: '90', creditnote_number: 'CN-001', customer_name: 'Acme Inc', status: 'open', date: '2026-03-15', total: 500, balance: 200 }],
    });
    await listCreditNotesHandler({ status: 'open' });
    expect(creditNotes.list).toHaveBeenCalledWith(expect.objectContaining({ filter_by: 'Status.Open' }));
    expect(out.stdout).toContain('CN-001');
    expect(out.stdout).toContain('Acme Inc');
  });

  it('uses getAll and emits raw JSON under --json', async () => {
    creditNotes.getAll.mockResolvedValue([{ creditnote_id: '1', creditnote_number: 'CN-001' }]);
    await listCreditNotesHandler({ json: true });
    expect(creditNotes.getAll).toHaveBeenCalled();
    expect(out.stdout).toContain('"creditnote_number": "CN-001"');
  });

  it('prints (no credit notes) when empty', async () => {
    creditNotes.list.mockResolvedValue({ data: [] });
    await listCreditNotesHandler({});
    expect(out.stdout).toContain('(no credit notes)');
  });
});
