import { jest } from '@jest/globals';
import { captureOutput } from '../helpers.js';

const ns = { create: jest.fn(), update: jest.fn(), delete: jest.fn(), markActive: jest.fn(), markInactive: jest.fn() };
jest.unstable_mockModule('../../src/cli/_helpers.js', () => ({
  clientFor: jest.fn(() => ({ widgets: ns })),
}));

const { makeWriteHandlers } = await import('../../src/cli/utils/write-commands.js');

const w = makeWriteHandlers({
  namespace: 'widgets',
  label: 'widget',
  idField: 'widget_id',
  buildBody: (a) => {
    const b = {};
    if (a.name !== undefined) b.name = a.name;
    return b;
  },
});

describe('makeWriteHandlers', () => {
  let out;
  beforeEach(() => { jest.clearAllMocks(); out = captureOutput(); });
  afterEach(() => out.restore());

  it('create posts the built body and reports the new id', async () => {
    ns.create.mockResolvedValue({ widget_id: 'W1' });
    await w.create({ name: 'x' });
    expect(ns.create).toHaveBeenCalledWith({ name: 'x' });
    expect(out.stdout).toContain('Created widget W1');
  });

  it('edit refuses an empty update', async () => {
    await expect(w.edit({ id: 'W1' })).rejects.toThrow(/Nothing to update/);
    expect(ns.update).not.toHaveBeenCalled();
  });

  it('delete guards on --yes', async () => {
    await expect(w.remove({ id: 'W1' })).rejects.toThrow(/--yes/);
    ns.delete.mockResolvedValue({});
    await w.remove({ id: 'W1', yes: true });
    expect(ns.delete).toHaveBeenCalledWith('W1');
  });

  it('activate/deactivate call the status endpoints', async () => {
    await w.activate({ id: 'W1' });
    expect(ns.markActive).toHaveBeenCalledWith('W1');
    await w.deactivate({ id: 'W1' });
    expect(ns.markInactive).toHaveBeenCalledWith('W1');
  });
});
