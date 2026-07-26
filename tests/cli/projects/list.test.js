import { jest } from '@jest/globals';
import { captureOutput } from '../../helpers.js';

const projects = { list: jest.fn(), getAll: jest.fn() };
jest.unstable_mockModule('../../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ projects })),
}));

const { listProjectsHandler } = await import('../../../src/cli/projects/list.js');

describe('listProjectsHandler', () => {
  let out;
  beforeEach(() => {
    jest.clearAllMocks();
    out = captureOutput();
  });
  afterEach(() => out.restore());

  it('renders a table of projects', async () => {
    projects.list.mockResolvedValue({
      data: [{ project_id: '7712', project_name: 'Website Redesign', customer_name: 'Acme Inc', status: 'active', billing_type: 'fixed_cost' }],
    });
    await listProjectsHandler({});
    expect(out.stdout).toContain('Website Redesign');
    expect(out.stdout).toContain('7712');
  });

  it('emits raw JSON under --json', async () => {
    projects.getAll.mockResolvedValue([{ project_id: '1', project_name: 'Website Redesign' }]);
    await listProjectsHandler({ json: true });
    expect(out.stdout).toContain('"project_name": "Website Redesign"');
  });

  it('prints (no projects) when empty', async () => {
    projects.list.mockResolvedValue({ data: [] });
    await listProjectsHandler({});
    expect(out.stdout).toContain('(no projects)');
  });
});
