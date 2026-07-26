import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const estimates = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ estimates })),
}));

const { listEstimatesHandler } = await import('../../../src/cli/estimates/list.js');

describe('listEstimatesHandler', () => {
  let out;
  beforeEach(() => {
    jest.clearAllMocks();
    out = captureOutput();
  });
  afterEach(() => out.restore());

  it('maps --status to filter_by and renders a table', async () => {
    estimates.list.mockResolvedValue({
      data: [{ estimate_id: '55', estimate_number: 'EST-001', customer_name: 'Acme Inc', status: 'sent', date: '2026-03-15', total: 1200 }],
    });
    await listEstimatesHandler({ status: 'sent' });
    expect(estimates.list).toHaveBeenCalledWith(expect.objectContaining({ filter_by: 'Status.Sent' }));
    expect(out.stdout).toContain('EST-001');
    expect(out.stdout).toContain('Acme Inc');
  });

  it('uses getAll and emits raw JSON under --json', async () => {
    estimates.getAll.mockResolvedValue([{ estimate_id: '1', estimate_number: 'EST-001' }]);
    await listEstimatesHandler({ json: true });
    expect(estimates.getAll).toHaveBeenCalled();
    expect(out.stdout).toContain('"estimate_number": "EST-001"');
  });

  it('prints (no estimates) when empty', async () => {
    estimates.list.mockResolvedValue({ data: [] });
    await listEstimatesHandler({});
    expect(out.stdout).toContain('(no estimates)');
  });
});
