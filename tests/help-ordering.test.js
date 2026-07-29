import { describe, it, expect } from '@jest/globals';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const bin = join(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'cli.js');

/** Run `<command> --help` and return the heading lines in the order shown. */
function helpHeadings(args) {
  // Drop NODE_OPTIONS so a VS Code debugger bootloader can't pollute stdout.
  const { NODE_OPTIONS, ...env } = process.env;
  const out = execFileSync('node', [bin, ...args.split(' '), '--help'], {
    encoding: 'utf8',
    env,
  });
  return out
    .split('\n')
    .filter((l) => /^(Positionals:|Options:|Global Options:)$/.test(l));
}

describe('help layout', () => {
  it("shows a command's own options above the inherited global ones", () => {
    // invoices show <id>: Positionals (id) → Options (json) → Global Options (profile/help/version)
    expect(helpHeadings('invoices show x')).toEqual([
      'Positionals:',
      'Options:',
      'Global Options:',
    ]);
  });

  it('keeps positionals first when field options are bundled before the positional', () => {
    // contacts edit passes the positional INTO contactFieldOptions(); positional must still lead.
    expect(helpHeadings('contacts edit x')).toEqual([
      'Positionals:',
      'Options:',
      'Global Options:',
    ]);
  });

  it('omits an empty Options group for commands with no local options', () => {
    // contacts activate <id>: positional only, no local flags.
    expect(helpHeadings('contacts activate x')).toEqual([
      'Positionals:',
      'Global Options:',
    ]);
  });

  it('groups global options under their own heading even without positionals', () => {
    // auth status: local --json, no positional.
    expect(helpHeadings('auth status')).toEqual(['Options:', 'Global Options:']);
  });
});
