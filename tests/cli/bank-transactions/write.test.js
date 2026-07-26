import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';
import { parseFields, CATEGORIZE_TARGETS } from '../../../src/cli/bank-transactions/_body.js';

const bankTransactions = { create: jest.fn(), categorize: jest.fn(), exclude: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ bankTransactions })),
}));
const { categorizeHandler, createTransactionHandler } = await import('../../../src/cli/bank-transactions/write.js');

describe('bank-transaction body helpers', () => {
  it('parseFields keeps values as strings so 19-digit ids are not corrupted', () => {
    expect(parseFields(['account_id=1110687000000112010', 'amount=100'])).toEqual({
      account_id: '1110687000000112010',
      amount: '100',
    });
  });

  it('maps --as expense to the expenses target; transfer is generic', () => {
    expect(CATEGORIZE_TARGETS.expense).toBe('expenses');
    expect(CATEGORIZE_TARGETS.transfer).toBeUndefined();
  });
});

describe('categorizeHandler', () => {
  let out;
  beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
  afterEach(() => out.restore());

  it('categorizes to the dedicated target with the built body', async () => {
    bankTransactions.categorize.mockResolvedValue({});
    await categorizeHandler({ id: 'T1', as: 'expense', field: ['account_id=A1'] });
    expect(bankTransactions.categorize).toHaveBeenCalledWith('T1', 'expenses', { account_id: 'A1' });
  });

  it('adds transaction_type for the generic form', async () => {
    bankTransactions.categorize.mockResolvedValue({});
    await categorizeHandler({ id: 'T1', as: 'transfer' });
    expect(bankTransactions.categorize).toHaveBeenCalledWith('T1', undefined, { transaction_type: 'transfer' });
  });

  it('rejects an unknown --as', async () => {
    await expect(categorizeHandler({ id: 'T1', as: 'bogus' })).rejects.toThrow(/Unknown --as/);
  });
});

describe('createTransactionHandler', () => {
  let out;
  beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
  afterEach(() => out.restore());

  it('requires --account-id', async () => {
    await expect(createTransactionHandler({ type: 'deposit', amount: 1, date: '2026-07-26' })).rejects.toThrow(/--account-id/);
  });
});
