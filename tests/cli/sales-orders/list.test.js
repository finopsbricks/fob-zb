import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const salesOrders = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ salesOrders })),
}));

const { listSalesOrdersHandler } = await import('../../../src/cli/sales-orders/list.js');

describe('listSalesOrdersHandler', () => {
  let out;
  beforeEach(() => {
    jest.clearAllMocks();
    out = captureOutput();
  });
  afterEach(() => out.restore());

  it('maps --status to filter_by and renders a table', async () => {
    salesOrders.list.mockResolvedValue({
      data: [{ salesorder_id: '77', salesorder_number: 'SO-001', customer_name: 'Acme Inc', status: 'open', date: '2026-03-15', total: 3400 }],
    });
    await listSalesOrdersHandler({ status: 'open' });
    expect(salesOrders.list).toHaveBeenCalledWith(expect.objectContaining({ filter_by: 'Status.Open' }));
    expect(out.stdout).toContain('SO-001');
    expect(out.stdout).toContain('Acme Inc');
  });

  it('uses getAll and emits raw JSON under --json', async () => {
    salesOrders.getAll.mockResolvedValue([{ salesorder_id: '1', salesorder_number: 'SO-001' }]);
    await listSalesOrdersHandler({ json: true });
    expect(salesOrders.getAll).toHaveBeenCalled();
    expect(out.stdout).toContain('"salesorder_number": "SO-001"');
  });

  it('prints (no sales orders) when empty', async () => {
    salesOrders.list.mockResolvedValue({ data: [] });
    await listSalesOrdersHandler({});
    expect(out.stdout).toContain('(no sales orders)');
  });
});
