import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const recurringExpenses = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ recurringExpenses })),
}));

const { listRecurringExpensesHandler } = await import('../../../src/cli/recurring-expenses/list.js');

describe('listRecurringExpensesHandler', () => {
  let out;
  beforeEach(() => {
    jest.clearAllMocks();
    out = captureOutput();
  });
  afterEach(() => out.restore());

  it('renders a table of recurring expenses', async () => {
    recurringExpenses.list.mockResolvedValue({
      data: [{ recurring_expense_id: '8927', recurrence_name: 'Cloud Hosting', account_name: 'IT Expenses', status: 'active', recurrence_frequency: 'months', total: 250 }],
    });
    await listRecurringExpensesHandler({});
    expect(out.stdout).toContain('Cloud Hosting');
    expect(out.stdout).toContain('8927');
  });

  it('emits raw JSON under --json', async () => {
    recurringExpenses.getAll.mockResolvedValue([{ recurring_expense_id: '1', recurrence_name: 'Weekly' }]);
    await listRecurringExpensesHandler({ json: true });
    expect(out.stdout).toContain('"recurrence_name": "Weekly"');
  });

  it('prints (no recurring expenses) when empty', async () => {
    recurringExpenses.list.mockResolvedValue({ data: [] });
    await listRecurringExpensesHandler({});
    expect(out.stdout).toContain('(no recurring expenses)');
  });
});
