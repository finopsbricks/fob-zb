import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';
import { parseLine, buildInvoiceBody } from '../../../src/cli/invoices/_body.js';

const invoices = { create: jest.fn(), markVoid: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ invoices })),
}));
const { createInvoiceHandler, markVoidInvoiceHandler } = await import('../../../src/cli/invoices/write.js');

describe('invoice body building', () => {
  it('parseLine parses k=v pairs and coerces numerics', () => {
    expect(parseLine('item_id=I1,quantity=2,rate=100,description=Hi')).toEqual({
      item_id: 'I1', quantity: 2, rate: 100, description: 'Hi',
    });
  });

  it('builds line_items from single-line flags', () => {
    expect(buildInvoiceBody({ customer: 'C1', item: 'I1', quantity: 2, rate: 100 })).toEqual({
      customer_id: 'C1',
      line_items: [{ item_id: 'I1', quantity: 2, rate: 100 }],
    });
  });

  it('builds multiple line_items from repeatable --line', () => {
    const b = buildInvoiceBody({ customer: 'C1', line: ['item_id=I1,quantity=1,rate=10', 'description=Ad hoc,rate=5'] });
    expect(b.line_items).toHaveLength(2);
    expect(b.line_items[1]).toEqual({ description: 'Ad hoc', rate: 5 });
  });
});

describe('createInvoiceHandler', () => {
  let out;
  beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
  afterEach(() => out.restore());

  it('requires --customer', async () => {
    await expect(createInvoiceHandler({ item: 'I1', rate: 1 })).rejects.toThrow(/--customer/);
  });

  it('requires at least one line', async () => {
    await expect(createInvoiceHandler({ customer: 'C1' })).rejects.toThrow(/line is required/);
  });

  it('creates and reports the new invoice', async () => {
    invoices.create.mockResolvedValue({ invoice_id: 'INV1', invoice_number: 'INV-1', status: 'draft', total: 100 });
    await createInvoiceHandler({ customer: 'C1', item: 'I1', rate: 100, quantity: 1 });
    expect(invoices.create).toHaveBeenCalledWith({ customer_id: 'C1', line_items: [{ item_id: 'I1', quantity: 1, rate: 100 }] });
    expect(out.stdout).toContain('Created invoice INV1');
  });
});

describe('markVoidInvoiceHandler', () => {
  let out;
  beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
  afterEach(() => out.restore());

  it('voids the invoice', async () => {
    invoices.markVoid.mockResolvedValue({});
    await markVoidInvoiceHandler({ id: 'INV1' });
    expect(invoices.markVoid).toHaveBeenCalledWith('INV1');
    expect(out.stdout).toContain('Voided invoice INV1');
  });
});
