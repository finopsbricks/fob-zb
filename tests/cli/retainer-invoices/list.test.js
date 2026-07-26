import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const retainerInvoices = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ retainerInvoices })),
}));

const { listRetainerInvoicesHandler } = await import('../../../src/cli/retainer-invoices/list.js');

describe('listRetainerInvoicesHandler', () => {
  let out;
  beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
  afterEach(() => out.restore());

  it('maps --status and --customer to Zoho params', async () => {
    retainerInvoices.list.mockResolvedValue({ data: [{ retainerinvoice_id: '1', retainerinvoice_number: 'RET-1', total: 10 }], page_context: {} });
    await listRetainerInvoicesHandler({ status: 'sent', customer: 'C1', page: 1, perPage: 200 });
    expect(retainerInvoices.list).toHaveBeenCalledWith(
      expect.objectContaining({ filter_by: 'Status.Sent', customer_id: 'C1' }),
    );
    expect(out.stdout).toContain('RET-1');
  });

  it('auto-paginates for --json', async () => {
    retainerInvoices.getAll.mockResolvedValue([{ retainerinvoice_id: '1', retainerinvoice_number: 'RET-1' }]);
    await listRetainerInvoicesHandler({ json: true });
    expect(retainerInvoices.getAll).toHaveBeenCalled();
    expect(out.stdout).toContain('"retainerinvoice_number": "RET-1"');
  });

  it('prints (no retainer invoices) when empty', async () => {
    retainerInvoices.list.mockResolvedValue({ data: [] });
    await listRetainerInvoicesHandler({});
    expect(out.stdout).toContain('(no retainer invoices)');
  });
});
