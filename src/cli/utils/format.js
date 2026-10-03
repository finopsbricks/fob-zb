/**
 * Shared formatting helpers for CLI output.
 * Structured text readable by both humans and LLMs; shared with the other
 * FinOpsBricks fob-* CLIs so output looks the same across tools.
 */

/**
 * Format a label: value field with aligned label.
 * "Name:      Acme Corp"
 */
export function formatField(label, value, labelWidth = 0) {
  const padded = (label + ':').padEnd(labelWidth || label.length + 1);
  return `${padded}  ${value ?? '—'}`;
}

/**
 * Format a table with dynamic column widths.
 * @param {string[]} headers - Column header names
 * @param {string[][]} rows - Array of row arrays (strings)
 * @param {{ align?: Array<'left'|'right'> }} [options] - Per-column alignment; defaults to all 'left'
 * @returns {string} Formatted table string
 */
export function formatTable(headers, rows, options = {}) {
  if (rows.length === 0) {
    return headers.join('  ') + '\n(none)';
  }

  const align = options.align ?? [];
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] || '').length)),
  );

  const pad = (text, width, i) =>
    align[i] === 'right' ? text.padStart(width) : text.padEnd(width);

  const headerLine = headers.map((h, i) => pad(h, widths[i], i)).join('  ');
  const separator = '-'.repeat(headerLine.length);
  const dataLines = rows.map((row) =>
    row.map((cell, i) => pad(cell || '—', widths[i], i)).join('  '),
  );

  return [headerLine, separator, ...dataLines].join('\n');
}

/**
 * Format rows as RFC-4180 CSV.
 * Cells containing commas, quotes, or newlines are double-quoted, and embedded
 * quotes are doubled. `null` / `undefined` become empty.
 */
export function formatCsv(headers, rows) {
  const escape = (value) => {
    if (value == null) return '';
    const s = String(value);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) lines.push(row.map(escape).join(','));
  return lines.join('\r\n');
}

/**
 * Format a decimal currency value with thousands separators and 2 decimals.
 * Returns '' for null / undefined / 0.
 */
export function formatCurrency(value) {
  if (value == null || value === '' || Number(value) === 0) return '';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format an ISO / yyyy-mm-dd date string to human-readable date-time.
 * "2026-03-15 10:23:01" — a bare date stays "2026-03-15".
 */
export function formatDate(iso) {
  if (!iso) return '—';
  // Zoho dates are often bare yyyy-mm-dd; keep them as-is rather than shifting TZ.
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * One-line hint shown under a list when there are more pages.
 * Zoho paginates with `page` + `has_more_page`. Returns null on the last page.
 */
export function formatPaginationHint(pageContext) {
  if (!pageContext?.has_more_page) return null;
  const page = pageContext.page ?? 1;
  return `(more results — page ${page}; use --page ${page + 1} for the next page)`;
}

/**
 * Format a header line with right-aligned status.
 *   "Invoice: INV-001                  paid"
 */
export function formatHeader(label, id, status) {
  const left = `${label}: ${id}`;
  if (!status) return left;
  const minGap = 4;
  const width = Math.max(left.length + minGap + status.length, 60);
  return left + ' '.repeat(width - left.length - status.length) + status;
}

/**
 * Format a section divider.
 *   "--- Title ---"
 */
export function formatSection(title) {
  return `\n--- ${title} ---\n`;
}
