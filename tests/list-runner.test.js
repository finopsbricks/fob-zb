import { jest } from '@jest/globals';
import { captureOutput } from './helpers.js';
import { buildColumnSelector } from '../src/cli/utils/list.js';
import { runList } from '../src/cli/utils/list-runner.js';

const selector = buildColumnSelector({
  columns: {
    id: { header: 'ID', align: 'left', render: (r) => String(r.id), raw: (r) => r.id },
    name: { header: 'NAME', align: 'left', render: (r) => r.name ?? '', raw: (r) => r.name },
  },
  defaultFields: ['id', 'name'],
  publicFields: ['id', 'name'],
});

const rows = [{ id: 1, name: 'Acme' }, { id: 2, name: 'Beta' }];
const make = (over = {}) => ({
  argv: { ...over },
  selector,
  jsonKey: 'things',
  emptyLabel: '(no things)',
  list: async () => ({ data: rows, page_context: { has_more_page: false } }),
  getAll: async () => rows,
});

describe('runList', () => {
  let out;
  beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
  afterEach(() => out.restore());

  it('renders a table by default', async () => {
    await runList(make());
    expect(out.stdout).toContain('NAME');
    expect(out.stdout).toContain('Acme');
  });

  it('emits raw JSON under --json via getAll', async () => {
    await runList(make({ json: true }));
    expect(out.stdout).toContain('"things"');
    expect(out.stdout).toContain('"name": "Beta"');
  });

  it('emits CSV under --format csv (raw field-key headers, RFC-4180)', async () => {
    await runList(make({ format: 'csv' }));
    const lines = out.stdout.split(/\r?\n/);
    expect(lines[0]).toBe('id,name');
    expect(lines).toContain('2,Beta');
  });

  it('prints the empty label when a page has no rows', async () => {
    const opts = make();
    opts.list = async () => ({ data: [], page_context: null });
    await runList(opts);
    expect(out.stdout).toContain('(no things)');
  });
});
