import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const bankTransactions = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ bankTransactions })),
}));

const { listBankTransactionsHandler } = await import('../../../src/cli/bank-transactions/list.js');

describe('listBankTransactionsHandler', () => {
  let out;
  beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
  afterEach(() => out.restore());

  it('maps --account-id and --status to Zoho params', async () => {
    bankTransactions.list.mockResolvedValue({ data: [{ transaction_id: '1', transaction_type: 'deposit', amount: 5 }], page_context: {} });
    await listBankTransactionsHandler({ accountId: 'A1', status: 'uncategorized', page: 1, perPage: 200 });
    expect(bankTransactions.list).toHaveBeenCalledWith(
      expect.objectContaining({ account_id: 'A1', filter_by: 'Status.Uncategorized' }),
    );
    expect(out.stdout).toContain('deposit');
  });
});
