import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const recurringBills = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ recurringBills })),
}));

const { listRecurringBillsHandler } = await import('../../../src/cli/recurring-bills/list.js');

describe('listRecurringBillsHandler', () => {
  let out;
  beforeEach(() => {
    jest.clearAllMocks();
    out = captureOutput();
  });
  afterEach(() => out.restore());

  it('renders a table of recurring bills', async () => {
    recurringBills.list.mockResolvedValue({
      data: [{ recurring_bill_id: '8927', recurrence_name: 'Monthly Rent', vendor_name: 'Landlord LLC', status: 'active', recurrence_frequency: 'months', total: 3000 }],
    });
    await listRecurringBillsHandler({});
    expect(out.stdout).toContain('Monthly Rent');
    expect(out.stdout).toContain('8927');
  });

  it('emits raw JSON under --json', async () => {
    recurringBills.getAll.mockResolvedValue([{ recurring_bill_id: '1', recurrence_name: 'Weekly' }]);
    await listRecurringBillsHandler({ json: true });
    expect(out.stdout).toContain('"recurrence_name": "Weekly"');
  });

  it('prints (no recurring bills) when empty', async () => {
    recurringBills.list.mockResolvedValue({ data: [] });
    await listRecurringBillsHandler({});
    expect(out.stdout).toContain('(no recurring bills)');
  });
});
