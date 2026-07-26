import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const purchaseOrders = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ purchaseOrders })),
}));

const { listPurchaseOrdersHandler } = await import('../../../src/cli/purchase-orders/list.js');

describe('listPurchaseOrdersHandler', () => {
  let out;
  beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
  afterEach(() => out.restore());

  it('maps --status and --vendor to Zoho params', async () => {
    purchaseOrders.list.mockResolvedValue({ data: [{ purchaseorder_id: '1', purchaseorder_number: 'PO-1', total: 10 }], page_context: {} });
    await listPurchaseOrdersHandler({ status: 'open', vendor: 'V1', page: 1, perPage: 200 });
    expect(purchaseOrders.list).toHaveBeenCalledWith(
      expect.objectContaining({ filter_by: 'Status.Open', vendor_id: 'V1' }),
    );
    expect(out.stdout).toContain('PO-1');
  });

  it('auto-paginates for --json', async () => {
    purchaseOrders.getAll.mockResolvedValue([{ purchaseorder_id: '1', purchaseorder_number: 'PO-1' }]);
    await listPurchaseOrdersHandler({ json: true });
    expect(purchaseOrders.getAll).toHaveBeenCalled();
    expect(out.stdout).toContain('"purchaseorder_number": "PO-1"');
  });

  it('prints (no purchase orders) when empty', async () => {
    purchaseOrders.list.mockResolvedValue({ data: [] });
    await listPurchaseOrdersHandler({});
    expect(out.stdout).toContain('(no purchase orders)');
  });
});
