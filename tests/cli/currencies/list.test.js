import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const currencies = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ currencies })),
}));

const { listCurrenciesHandler } = await import('../../../src/cli/currencies/list.js');

describe('listCurrenciesHandler', () => {
  let out;
  beforeEach(() => {
    jest.clearAllMocks();
    out = captureOutput();
  });
  afterEach(() => out.restore());

  it('renders a table of currencies', async () => {
    currencies.list.mockResolvedValue({
      data: [{ currency_id: '8927', currency_code: 'USD', currency_name: 'US Dollar', currency_symbol: '$', is_base_currency: true }],
    });
    await listCurrenciesHandler({});
    expect(out.stdout).toContain('USD');
    expect(out.stdout).toContain('8927');
  });

  it('emits raw JSON under --json', async () => {
    currencies.getAll.mockResolvedValue([{ currency_id: '1', currency_code: 'USD' }]);
    await listCurrenciesHandler({ json: true });
    expect(out.stdout).toContain('"currency_code": "USD"');
  });

  it('prints (no currencies) when empty', async () => {
    currencies.list.mockResolvedValue({ data: [] });
    await listCurrenciesHandler({});
    expect(out.stdout).toContain('(no currencies)');
  });
});
