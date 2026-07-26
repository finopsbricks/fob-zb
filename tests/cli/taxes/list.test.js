import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const taxes = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ taxes })),
}));

const { listTaxesHandler } = await import('../../../src/cli/taxes/list.js');

describe('listTaxesHandler', () => {
  let out;
  beforeEach(() => {
    jest.clearAllMocks();
    out = captureOutput();
  });
  afterEach(() => out.restore());

  it('renders a table of taxes', async () => {
    taxes.list.mockResolvedValue({
      data: [{ tax_id: '8927', tax_name: 'GST', tax_percentage: 18, tax_type: 'tax' }],
    });
    await listTaxesHandler({});
    expect(out.stdout).toContain('GST');
    expect(out.stdout).toContain('8927');
  });

  it('emits raw JSON under --json', async () => {
    taxes.getAll.mockResolvedValue([{ tax_id: '1', tax_name: 'GST' }]);
    await listTaxesHandler({ json: true });
    expect(out.stdout).toContain('"tax_name": "GST"');
  });

  it('prints (no taxes) when empty', async () => {
    taxes.list.mockResolvedValue({ data: [] });
    await listTaxesHandler({});
    expect(out.stdout).toContain('(no taxes)');
  });
});
