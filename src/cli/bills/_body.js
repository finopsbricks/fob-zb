// @ts-check
/**
 * Bill write-field options + argv→Zoho-body mapping. Bill line items need an
 * `account_id` (expense/GL account) or an `item_id`.
 */

import { localOptions } from '../_helpers.js';

/** Parse one `k=v,k=v` --line string into a Zoho bill line-item object. */
export function parseBillLine(str) {
  const line = {};
  for (const part of String(str).split(',')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key) continue;
    if (key === 'account' || key === 'account_id') line.account_id = val;
    else if (key === 'item' || key === 'item_id') line.item_id = val;
    else if (key === 'quantity' || key === 'rate') line[key] = Number(val);
    else line[key] = val;
  }
  return line;
}

export function billFieldOptions(yargs) {
  return localOptions(yargs)
    .option('number', { describe: 'Bill number (vendor invoice no.) — required unless auto-numbering is enabled', type: 'string' })
    .option('date', { describe: 'Bill date (YYYY-MM-DD)', type: 'string' })
    .option('due-date', { describe: 'Due date (YYYY-MM-DD)', type: 'string' })
    .option('reference', { describe: 'Reference number', type: 'string' })
    .option('notes', { describe: 'Notes', type: 'string' })
    .option('line', { describe: 'Line "account_id=..,rate=..,quantity=..,description=.." (repeatable)', type: 'string', array: true })
    .option('account', { describe: 'Single line: expense/GL account id', type: 'string' })
    .option('item', { describe: 'Single line: item id', type: 'string' })
    .option('description', { describe: 'Single line: description', type: 'string' })
    .option('quantity', { describe: 'Single line: quantity', type: 'number' })
    .option('rate', { describe: 'Single line: rate', type: 'number' })
    .option('json', { describe: 'Output raw JSON of the saved record', type: 'boolean' });
}

export function buildBillBody(argv) {
  const body = {};
  if (argv.vendor !== undefined) body.vendor_id = argv.vendor;
  if (argv.number !== undefined) body.bill_number = argv.number;
  if (argv.date !== undefined) body.date = argv.date;
  if (argv.dueDate !== undefined) body.due_date = argv.dueDate;
  if (argv.reference !== undefined) body.reference_number = argv.reference;
  if (argv.notes !== undefined) body.notes = argv.notes;

  let lines = [];
  if (argv.line && argv.line.length) {
    lines = argv.line.map(parseBillLine);
  } else if (argv.account !== undefined || argv.item !== undefined || argv.rate !== undefined || argv.description !== undefined) {
    const l = {};
    if (argv.account !== undefined) l.account_id = argv.account;
    if (argv.item !== undefined) l.item_id = argv.item;
    if (argv.description !== undefined) l.description = argv.description;
    if (argv.quantity !== undefined) l.quantity = argv.quantity;
    if (argv.rate !== undefined) l.rate = argv.rate;
    lines = [l];
  }
  if (lines.length) body.line_items = lines;
  return body;
}
