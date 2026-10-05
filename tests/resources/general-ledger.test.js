import { jest } from '@jest/globals';
import { buildChartOfAccounts } from '../../src/resources/chart-of-accounts.js';
import { buildReports } from '../../src/resources/reports.js';

const leg = { transaction_id: 'T1', account_id: 'A1', debit_amount: 6000, credit_amount: '' };
const fakeCtx = (overrides = {}) => ({
  get: jest.fn(async () => ({ transactions: [leg], page_context: { has_more_page: false } })),
  getAll: jest.fn(async () => ({ data: [leg], page_context: null, truncated: true })),
  post: jest.fn(), put: jest.fn(), delete: jest.fn(), upload: jest.fn(),
  ...overrides,
});

it('chartOfAccounts.listTransactions reads one page for the account', async () => {
  const ctx = fakeCtx();
  const r = await buildChartOfAccounts(/** @type {any} */ (ctx)).listTransactions('A1', { page: 2 });
  expect(ctx.get).toHaveBeenCalledWith('/chartofaccounts/transactions', { searchParams: { page: 2, account_id: 'A1' } });
  expect(r).toEqual({ data: [leg], page_context: { has_more_page: false } });
});

it('chartOfAccounts.getAllTransactions walks pages and keeps the truncated flag', async () => {
  const ctx = fakeCtx();
  const r = await buildChartOfAccounts(/** @type {any} */ (ctx)).getAllTransactions('A1');
  expect(ctx.getAll).toHaveBeenCalledWith('/chartofaccounts/transactions', { searchParams: { account_id: 'A1' }, key: 'transactions' });
  expect(r).toEqual({ data: [leg], truncated: true });
});

it('the account_id argument wins over one in params', async () => {
  const ctx = fakeCtx();
  await buildChartOfAccounts(/** @type {any} */ (ctx)).listTransactions('A1', { account_id: 'OTHER' });
  expect(ctx.get.mock.calls[0][1].searchParams.account_id).toBe('A1');
});

it('reports.generalLedger returns the per-account rows', async () => {
  const rows = [{ account_id: 'A1', name: 'Rent Expense', debit_total: 24000, credit_total: 0, balance: 24000 }];
  const ctx = fakeCtx({ get: jest.fn(async () => ({ generalledger: rows, page_context: { report_type: 'general_ledger' } })) });
  const r = await buildReports(/** @type {any} */ (ctx)).generalLedger({ from_date: '2000-01-01', to_date: '2026-12-31' });
  expect(ctx.get).toHaveBeenCalledWith('/reports/generalledger', { searchParams: { from_date: '2000-01-01', to_date: '2026-12-31' } });
  expect(r.data).toEqual(rows);
});

it('reports.generalLedger refuses to call Zoho without both dates', async () => {
  const ctx = fakeCtx();
  const reports = buildReports(/** @type {any} */ (ctx));
  await expect(reports.generalLedger(/** @type {any} */ ({ to_date: '2026-12-31' }))).rejects.toThrow(/from_date and to_date/);
  expect(ctx.get).not.toHaveBeenCalled();
});

it('reports.accountTransactions sets the custom-date filter and flattens the nested rows', async () => {
  const row = { transaction_id: 'P1', account_id: 'A1', date: '2026-09-09', debit: 162000, credit: '' };
  const ctx = fakeCtx({ get: jest.fn(async () => ({ account_transactions: [{ account_transactions: [row] }], page_context: { has_more_page: false } })) });
  const r = await buildReports(/** @type {any} */ (ctx)).accountTransactions({ from_date: '2026-09-09', to_date: '2026-09-09' });
  expect(ctx.get).toHaveBeenCalledWith('/reports/accounttransaction', { searchParams: { filter_by: 'TransactionDate.CustomDate', per_page: 200, from_date: '2026-09-09', to_date: '2026-09-09' } });
  expect(r.data).toEqual([row]);
});

it('reports.getAllAccountTransactions walks every page', async () => {
  const page = (n, more) => ({ account_transactions: [{ account_transactions: [{ transaction_id: `T${n}` }] }], page_context: { has_more_page: more } });
  const get = jest.fn().mockResolvedValueOnce(page(1, true)).mockResolvedValueOnce(page(2, true)).mockResolvedValueOnce(page(3, false));
  const r = await buildReports(/** @type {any} */ (fakeCtx({ get }))).getAllAccountTransactions({ from_date: '2000-01-01', to_date: '2026-12-31' });
  expect(r).toEqual({ data: [{ transaction_id: 'T1' }, { transaction_id: 'T2' }, { transaction_id: 'T3' }], truncated: false });
  expect(get.mock.calls.map((c) => c[1].searchParams.page)).toEqual([1, 2, 3]);
});

it('reports.accountTransactions requires a period', async () => {
  await expect(buildReports(/** @type {any} */ (fakeCtx())).accountTransactions(/** @type {any} */ ({}))).rejects.toThrow(/from_date and to_date are required/);
});
