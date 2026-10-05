import { jest } from '@jest/globals';
import { buildBankAccounts } from '../../src/resources/bank-accounts.js';

const fakeCtx = () => ({
  post: jest.fn(async () => ({ code: 0, message: 'imported' })),
  get: jest.fn(async () => ({ statement: { statement_id: 'S1', from_date: '2026-07-01' } })),
  delete: jest.fn(async () => ({ code: 0 })), put: jest.fn(), getAll: jest.fn(), upload: jest.fn(),
});

const body = {
  account_id: 'A1', start_date: '2026-07-01', end_date: '2026-07-31',
  transactions: [{ date: '2026-07-10', debit_or_credit: 'debit', amount: 10, reference_number: 'r1' }],
};

it('importStatement posts the statement to /bankstatements', async () => {
  const ctx = fakeCtx();
  await buildBankAccounts(/** @type {any} */ (ctx)).importStatement(/** @type {any} */ (body));
  expect(ctx.post).toHaveBeenCalledWith('/bankstatements', body);
});

it('lastImportedStatement unwraps the statement', async () => {
  const ctx = fakeCtx();
  const s = await buildBankAccounts(/** @type {any} */ (ctx)).lastImportedStatement('A 1');
  expect(ctx.get).toHaveBeenCalledWith('/bankaccounts/A%201/statement/lastimported');
  expect(s).toEqual({ statement_id: 'S1', from_date: '2026-07-01' });
});

it('lastImportedStatement returns null when there is none', async () => {
  const ctx = fakeCtx();
  ctx.get.mockResolvedValueOnce(/** @type {any} */ ({}));
  expect(await buildBankAccounts(/** @type {any} */ (ctx)).lastImportedStatement('A1')).toBeNull();
});

it('deleteLastImportedStatement deletes by account and statement id', async () => {
  const ctx = fakeCtx();
  await buildBankAccounts(/** @type {any} */ (ctx)).deleteLastImportedStatement('A1', 'S1');
  expect(ctx.delete).toHaveBeenCalledWith('/bankaccounts/A1/statement/S1');
});
