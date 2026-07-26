import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const invoices = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ invoices })),
}));

const { listInvoicesHandler } = await import('../../../src/cli/invoices/list.js');

describe('listInvoicesHandler', () => {
  let out;
  beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
  afterEach(() => out.restore());

  it('maps --status and --customer to Zoho params', async () => {
    invoices.list.mockResolvedValue({ data: [{ invoice_id: '1', invoice_number: 'INV-1', total: 10 }], page_context: {} });
    await listInvoicesHandler({ status: 'overdue', customer: 'C1', page: 1, perPage: 200 });
    expect(invoices.list).toHaveBeenCalledWith(
      expect.objectContaining({ filter_by: 'Status.OverDue', customer_id: 'C1' }),
    );
    expect(out.stdout).toContain('INV-1');
  });

  it('auto-paginates for --json', async () => {
    invoices.getAll.mockResolvedValue([{ invoice_id: '1', invoice_number: 'INV-1' }]);
    await listInvoicesHandler({ json: true });
    expect(invoices.getAll).toHaveBeenCalled();
    expect(out.stdout).toContain('"invoice_number": "INV-1"');
  });
});
