import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';
import { parseBillLine, buildBillBody } from '../../../src/cli/bills/_body.js';

const bills = { create: jest.fn(), markVoid: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ bills })),
}));
const { createBillHandler } = await import('../../../src/cli/bills/write.js');

describe('bill body building', () => {
  it('parseBillLine maps account= to account_id and coerces numerics', () => {
    expect(parseBillLine('account=A1,rate=100,quantity=2')).toEqual({ account_id: 'A1', rate: 100, quantity: 2 });
  });

  it('builds a line from single-line flags with the expense account', () => {
    expect(buildBillBody({ vendor: 'V1', account: 'A1', rate: 100, quantity: 1 })).toEqual({
      vendor_id: 'V1',
      line_items: [{ account_id: 'A1', quantity: 1, rate: 100 }],
    });
  });
});

describe('createBillHandler', () => {
  let out;
  beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
  afterEach(() => out.restore());

  it('requires --vendor', async () => {
    await expect(createBillHandler({ account: 'A1', rate: 1 })).rejects.toThrow(/--vendor/);
  });

  it('requires a line', async () => {
    await expect(createBillHandler({ vendor: 'V1' })).rejects.toThrow(/line is required/);
  });

  it('creates and reports', async () => {
    bills.create.mockResolvedValue({ bill_id: 'B1', bill_number: 'TB-1', status: 'open', total: 100 });
    await createBillHandler({ vendor: 'V1', account: 'A1', rate: 100, quantity: 1 });
    expect(bills.create).toHaveBeenCalledWith({ vendor_id: 'V1', line_items: [{ account_id: 'A1', quantity: 1, rate: 100 }] });
    expect(out.stdout).toContain('Created bill B1');
  });
});
