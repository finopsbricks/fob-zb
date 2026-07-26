// @ts-check
/**
 * Invoice write-field options + argv→Zoho-body mapping.
 *
 * Line items are the tricky part. Three ways to express them, in precedence order:
 *   1. --line "item_id=..,quantity=..,rate=..,description=.." (repeatable) for N lines
 *   2. a single line from --item/--description/--quantity/--rate
 * Each line needs either an item_id (Zoho pulls name/rate) or a name/description + rate (ad-hoc).
 */

/** Parse one `k=v,k=v` --line string into a Zoho line-item object. */
export function parseLine(str) {
  const line = {};
  for (const part of String(str).split(',')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key) continue;
    if (key === 'item' || key === 'item_id') line.item_id = val;
    else if (key === 'quantity' || key === 'rate') line[key] = Number(val);
    else line[key] = val;
  }
  return line;
}

export function invoiceFieldOptions(yargs) {
  return yargs
    .option('number', { describe: 'Invoice number (default: auto)', type: 'string' })
    .option('date', { describe: 'Invoice date (YYYY-MM-DD)', type: 'string' })
    .option('due-date', { describe: 'Due date (YYYY-MM-DD)', type: 'string' })
    .option('reference', { describe: 'Reference number', type: 'string' })
    .option('notes', { describe: 'Customer notes', type: 'string' })
    .option('terms', { describe: 'Terms & conditions', type: 'string' })
    .option('line', { describe: 'Line item "item_id=..,quantity=..,rate=..,description=.." (repeatable)', type: 'string', array: true })
    .option('item', { describe: 'Single line: item id', type: 'string' })
    .option('description', { describe: 'Single line: description (ad-hoc line)', type: 'string' })
    .option('quantity', { describe: 'Single line: quantity', type: 'number' })
    .option('rate', { describe: 'Single line: rate', type: 'number' })
    .option('json', { describe: 'Output raw JSON of the saved record', type: 'boolean' });
}

export function buildInvoiceBody(argv) {
  const body = {};
  if (argv.customer !== undefined) body.customer_id = argv.customer;
  if (argv.number !== undefined) body.invoice_number = argv.number;
  if (argv.date !== undefined) body.date = argv.date;
  if (argv.dueDate !== undefined) body.due_date = argv.dueDate;
  if (argv.reference !== undefined) body.reference_number = argv.reference;
  if (argv.notes !== undefined) body.notes = argv.notes;
  if (argv.terms !== undefined) body.terms = argv.terms;

  let lines = [];
  if (argv.line && argv.line.length) {
    lines = argv.line.map(parseLine);
  } else if (argv.item !== undefined || argv.rate !== undefined || argv.description !== undefined) {
    const l = {};
    if (argv.item !== undefined) l.item_id = argv.item;
    if (argv.description !== undefined) l.description = argv.description;
    if (argv.quantity !== undefined) l.quantity = argv.quantity;
    if (argv.rate !== undefined) l.rate = argv.rate;
    lines = [l];
  }
  if (lines.length) body.line_items = lines;
  return body;
}
