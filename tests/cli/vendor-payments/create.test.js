import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';
import { buildVendorPaymentBody } from '../../../src/cli/vendor-payments/_body.js';

const vendorPayments = { create: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ vendorPayments })),
}));
const { createVendorPaymentHandler } = await import('../../../src/cli/vendor-payments/create.js');

describe('buildVendorPaymentBody', () => {
  it('applies the full amount to a single --bill', () => {
    const b = buildVendorPaymentBody({ vendor: 'V1', amount: 1500, date: '2026-07-26', paidThrough: 'A1', mode: 'cash', bill: 'B1' });
    expect(b).toEqual({
      vendor_id: 'V1', amount: 1500, date: '2026-07-26', payment_mode: 'cash',
      paid_through_account_id: 'A1', bills: [{ bill_id: 'B1', amount_applied: 1500 }],
    });
  });

  it('parses repeatable --apply bill_id=amount', () => {
    const b = buildVendorPaymentBody({ vendor: 'V1', amount: 300, date: '2026-07-26', paidThrough: 'A1', apply: ['B1=100', 'B2=200'] });
    expect(b.bills).toEqual([{ bill_id: 'B1', amount_applied: 100 }, { bill_id: 'B2', amount_applied: 200 }]);
  });
});

describe('createVendorPaymentHandler', () => {
  let out;
  beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
  afterEach(() => out.restore());

  it('requires --paid-through', async () => {
    await expect(createVendorPaymentHandler({ vendor: 'V1', amount: 100, date: '2026-07-26' })).rejects.toThrow(/--paid-through/);
  });

  it('records the payment', async () => {
    vendorPayments.create.mockResolvedValue({ payment_id: 'P1', amount: 1500, vendor_name: 'Acme' });
    await createVendorPaymentHandler({ vendor: 'V1', amount: 1500, date: '2026-07-26', paidThrough: 'A1', bill: 'B1' });
    expect(vendorPayments.create).toHaveBeenCalled();
    expect(out.stdout).toContain('Recorded vendor payment P1');
  });
});
