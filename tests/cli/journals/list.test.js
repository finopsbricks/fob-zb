import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const journals = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ journals })),
}));

const { listJournalsHandler } = await import('../../../src/cli/journals/list.js');

describe('listJournalsHandler', () => {
  let out;
  beforeEach(() => {
    jest.clearAllMocks();
    out = captureOutput();
  });
  afterEach(() => out.restore());

  it('renders a table of journals', async () => {
    journals.list.mockResolvedValue({
      data: [{ journal_id: '4501', journal_date: '2026-03-15', entry_number: 'JE-001', reference_number: 'REF-9', total: 1200, status: 'published' }],
    });
    await listJournalsHandler({});
    expect(out.stdout).toContain('JE-001');
    expect(out.stdout).toContain('4501');
  });

  it('emits raw JSON under --json', async () => {
    journals.getAll.mockResolvedValue([{ journal_id: '1', entry_number: 'JE-001' }]);
    await listJournalsHandler({ json: true });
    expect(out.stdout).toContain('"entry_number": "JE-001"');
  });

  it('prints (no journals) when empty', async () => {
    journals.list.mockResolvedValue({ data: [] });
    await listJournalsHandler({});
    expect(out.stdout).toContain('(no journals)');
  });
});
