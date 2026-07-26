import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const recurringInvoices = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ recurringInvoices })),
}));

const { listRecurringInvoicesHandler } = await import('../../../src/cli/recurring-invoices/list.js');

describe('listRecurringInvoicesHandler', () => {
  let out;
  beforeEach(() => {
    jest.clearAllMocks();
    out = captureOutput();
  });
  afterEach(() => out.restore());

  it('renders a table of recurring invoices', async () => {
    recurringInvoices.list.mockResolvedValue({
      data: [{ recurring_invoice_id: '8927', recurrence_name: 'Monthly Retainer', customer_name: 'Acme Inc', status: 'active', recurrence_frequency: 'months', total: 1200 }],
    });
    await listRecurringInvoicesHandler({});
    expect(out.stdout).toContain('Monthly Retainer');
    expect(out.stdout).toContain('8927');
  });

  it('emits raw JSON under --json', async () => {
    recurringInvoices.getAll.mockResolvedValue([{ recurring_invoice_id: '1', recurrence_name: 'Weekly' }]);
    await listRecurringInvoicesHandler({ json: true });
    expect(out.stdout).toContain('"recurrence_name": "Weekly"');
  });

  it('prints (no recurring invoices) when empty', async () => {
    recurringInvoices.list.mockResolvedValue({ data: [] });
    await listRecurringInvoicesHandler({});
    expect(out.stdout).toContain('(no recurring invoices)');
  });
});
