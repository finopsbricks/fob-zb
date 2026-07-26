import { jest } from '@jest/globals';
import { parseLine, buildDocumentBody } from '../../src/cli/utils/document-write.js';

describe('document-write helpers', () => {
  it('parseLine maps item=/account= and coerces numerics', () => {
    expect(parseLine('item=I1,quantity=2,rate=100,description=Hi')).toEqual({ item_id: 'I1', quantity: 2, rate: 100, description: 'Hi' });
    expect(parseLine('account=A1,rate=50')).toEqual({ account_id: 'A1', rate: 50 });
  });

  it('buildDocumentBody uses partyArgKey → partyField and numberField', () => {
    const body = buildDocumentBody(
      { customer: 'C1', number: 'EST-1', date: '2026-07-26', item: 'I1', rate: 100, quantity: 2 },
      { partyField: 'customer_id', numberField: 'estimate_number', partyArgKey: 'customer' },
    );
    expect(body).toEqual({
      customer_id: 'C1',
      estimate_number: 'EST-1',
      date: '2026-07-26',
      line_items: [{ item_id: 'I1', quantity: 2, rate: 100 }],
    });
  });

  it('buildDocumentBody supports vendor party + repeatable --line', () => {
    const body = buildDocumentBody(
      { vendor: 'V1', line: ['account=A1,rate=10,quantity=1', 'item=I2,rate=5'] },
      { partyField: 'vendor_id', numberField: 'purchaseorder_number', partyArgKey: 'vendor' },
    );
    expect(body.vendor_id).toBe('V1');
    expect(body.line_items).toEqual([
      { account_id: 'A1', rate: 10, quantity: 1 },
      { item_id: 'I2', rate: 5 },
    ]);
  });
});
