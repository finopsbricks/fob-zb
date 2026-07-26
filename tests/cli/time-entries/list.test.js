import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const timeEntries = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ timeEntries })),
}));

const { listTimeEntriesHandler } = await import('../../../src/cli/time-entries/list.js');

describe('listTimeEntriesHandler', () => {
  let out;
  beforeEach(() => {
    jest.clearAllMocks();
    out = captureOutput();
  });
  afterEach(() => out.restore());

  it('renders a table of time entries', async () => {
    timeEntries.list.mockResolvedValue({
      data: [{ time_entry_id: '9931', project_name: 'Website Redesign', task_name: 'Design', user_name: 'Jane Doe', log_date: '2026-03-15', log_time: '2:30' }],
    });
    await listTimeEntriesHandler({});
    expect(out.stdout).toContain('Website Redesign');
    expect(out.stdout).toContain('9931');
  });

  it('emits raw JSON under --json', async () => {
    timeEntries.getAll.mockResolvedValue([{ time_entry_id: '1', project_name: 'Website Redesign' }]);
    await listTimeEntriesHandler({ json: true });
    expect(out.stdout).toContain('"project_name": "Website Redesign"');
  });

  it('prints (no time entries) when empty', async () => {
    timeEntries.list.mockResolvedValue({ data: [] });
    await listTimeEntriesHandler({});
    expect(out.stdout).toContain('(no time entries)');
  });
});
