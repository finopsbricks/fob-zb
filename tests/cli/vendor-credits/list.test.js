import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const vendorCredits = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ vendorCredits })),
}));

const { listVendorCreditsHandler } = await import('../../../src/cli/vendor-credits/list.js');

describe('listVendorCreditsHandler', () => {
  let out;
  beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
  afterEach(() => out.restore());

  it('maps --status and --vendor to Zoho params', async () => {
    vendorCredits.list.mockResolvedValue({ data: [{ vendor_credit_id: '1', vendor_credit_number: 'VC-1', total: 10 }], page_context: {} });
    await listVendorCreditsHandler({ status: 'open', vendor: 'V1', page: 1, perPage: 200 });
    expect(vendorCredits.list).toHaveBeenCalledWith(
      expect.objectContaining({ filter_by: 'Status.Open', vendor_id: 'V1' }),
    );
    expect(out.stdout).toContain('VC-1');
  });

  it('auto-paginates for --json', async () => {
    vendorCredits.getAll.mockResolvedValue([{ vendor_credit_id: '1', vendor_credit_number: 'VC-1' }]);
    await listVendorCreditsHandler({ json: true });
    expect(vendorCredits.getAll).toHaveBeenCalled();
    expect(out.stdout).toContain('"vendor_credit_number": "VC-1"');
  });

  it('prints (no vendor credits) when empty', async () => {
    vendorCredits.list.mockResolvedValue({ data: [] });
    await listVendorCreditsHandler({});
    expect(out.stdout).toContain('(no vendor credits)');
  });
});
