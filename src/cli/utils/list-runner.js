// @ts-check
/**
 * Shared driver for `list` handlers. Every list command has the same shape:
 * default to a one-page human table, `--json` dumps the current page raw,
 * `--format csv|json` auto-paginates the whole set, `--output` writes to a file,
 * `--fields` selects columns. This centralizes that so per-resource handlers only
 * declare their columns + search params.
 *
 * Data goes to stdout; diagnostics (file-written notices, truncation, pagination
 * hints) go to stderr/stdout per the output standard.
 */

import { writeFileSync } from 'node:fs';
import { MAX_ALL_ROWS } from '../../http.js';
import { formatTable, formatCsv, formatPaginationHint } from './format.js';

/**
 * @param {object} opts
 * @param {object} opts.argv                      Parsed yargs argv (reads fields/format/json/output/page/per-page)
 * @param {object} opts.selector                  buildColumnSelector() result
 * @param {() => Promise<{ data: any[], page_context?: object|null }>} opts.list   Fetch one page
 * @param {() => Promise<any[]>} opts.getAll       Fetch every row (auto-paginated)
 * @param {string} opts.jsonKey                   Envelope key for --format json (e.g. 'invoices')
 * @param {string} opts.emptyLabel                Printed when a page is empty (e.g. '(no invoices)')
 */
export async function runList({ argv, selector, list, getAll, jsonKey, emptyLabel }) {
  const fields = selector.parseFields(argv.fields);
  const format = argv.format ?? (argv.json ? 'json' : 'table');

  const emit = (text) => {
    if (argv.output) {
      writeFileSync(argv.output, text);
      console.error(`Wrote ${argv.output}`);
    } else {
      console.log(text);
    }
  };

  // Bulk paths auto-paginate the entire result set.
  if (format === 'csv' || format === 'json') {
    const data = await getAll();
    const truncated = data.length >= MAX_ALL_ROWS;
    if (format === 'json') {
      emit(JSON.stringify({ [jsonKey]: data }, null, 2));
    } else {
      emit(formatCsv(fields, selector.rawRows(data, fields)));
    }
    if (truncated) {
      console.error(`(truncated to first ${MAX_ALL_ROWS} rows — refine filters to narrow the result set)`);
    }
    return;
  }

  // Default: one page as a human table.
  const result = await list();
  const items = result?.data ?? [];
  if (items.length === 0) {
    console.log(emptyLabel);
    return;
  }
  console.log(
    formatTable(selector.headersFor(fields), selector.renderRows(items, fields), {
      align: selector.alignFor(fields),
    }),
  );
  const hint = formatPaginationHint(result?.page_context);
  if (hint) console.log(`\n${hint}`);
}
