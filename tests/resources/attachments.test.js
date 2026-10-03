import { jest } from '@jest/globals';
import { buildBills } from '../../src/resources/bills.js';
import { buildExpenses } from '../../src/resources/expenses.js';

const file = { filename: 'r.pdf', data: Buffer.from('x'), contentType: 'application/pdf' };
const fakeCtx = () => ({ upload: jest.fn(async () => ({ code: 0 })), post: jest.fn(async () => ({ expense: { expense_id: 'E1' } })), put: jest.fn(), get: jest.fn(), delete: jest.fn(), getAll: jest.fn() });

it('bills.addAttachment posts the file under field "attachment"', async () => {
  const ctx = fakeCtx();
  await buildBills(/** @type {any} */ (ctx)).addAttachment('B 1', file);
  expect(ctx.upload).toHaveBeenCalledWith('/bills/B%201/attachment', { ...file, field: 'attachment' });
});

it('expenses.addReceipt posts the file under field "receipt"', async () => {
  const ctx = fakeCtx();
  await buildExpenses(/** @type {any} */ (ctx)).addReceipt('E1', file);
  expect(ctx.upload).toHaveBeenCalledWith('/expenses/E1/receipt', { ...file, field: 'receipt' });
});

it('expenses.create returns the created expense', async () => {
  const ctx = fakeCtx();
  const e = await buildExpenses(/** @type {any} */ (ctx)).create({ amount: 10 });
  expect(ctx.post).toHaveBeenCalledWith('/expenses', { amount: 10 });
  expect(e).toEqual({ expense_id: 'E1' });
});
