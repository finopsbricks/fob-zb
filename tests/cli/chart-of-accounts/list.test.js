import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const chartOfAccounts = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ chartOfAccounts })),
}));

const { listChartOfAccountsHandler } = await import('../../../src/cli/chart-of-accounts/list.js');

describe('listChartOfAccountsHandler', () => {
  let out;
  beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
  afterEach(() => out.restore());

  it('maps --type to filter_by=AccountType.*', async () => {
    chartOfAccounts.list.mockResolvedValue({ data: [{ account_id: '1', account_name: 'Cash', account_type: 'cash' }], page_context: {} });
    await listChartOfAccountsHandler({ type: 'asset', page: 1, perPage: 200 });
    expect(chartOfAccounts.list).toHaveBeenCalledWith(expect.objectContaining({ filter_by: 'AccountType.Asset' }));
    expect(out.stdout).toContain('Cash');
  });
});
