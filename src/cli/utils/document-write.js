// @ts-check
/**
 * Shared write + action commands for sales/purchase documents (estimates,
 * sales-orders, credit-notes, purchase-orders). Mirrors the live-validated
 * invoices write layer; the party field/flag (customer vs vendor) and number
 * field differ per resource, so they're parameters.
 */
import { safe } from '../_helpers.js';
import { clientFor } from '../_helpers.js';

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
    else if (key === 'account' || key === 'account_id') line.account_id = val;
    else if (key === 'quantity' || key === 'rate') line[key] = Number(val);
    else line[key] = val;
  }
  return line;
}

/** Common document write-field yargs options (party + number added by the caller). */
export function documentFieldOptions(yargs) {
  return yargs
    .option('date', { describe: 'Document date (YYYY-MM-DD)', type: 'string' })
    .option('reference', { describe: 'Reference number', type: 'string' })
    .option('notes', { describe: 'Notes', type: 'string' })
    .option('line', { describe: 'Line "item_id=..,quantity=..,rate=..,description=.." (repeatable)', type: 'string', array: true })
    .option('item', { describe: 'Single line: item id', type: 'string' })
    .option('account', { describe: 'Single line: account id (expense/GL)', type: 'string' })
    .option('description', { describe: 'Single line: description', type: 'string' })
    .option('quantity', { describe: 'Single line: quantity', type: 'number' })
    .option('rate', { describe: 'Single line: rate', type: 'number' })
    .option('json', { describe: 'Output raw JSON of the saved record', type: 'boolean' });
}

/** argv → Zoho document body. Reads the party id from argv[partyArgKey]. */
export function buildDocumentBody(argv, { partyField, numberField, partyArgKey }) {
  const body = {};
  if (argv[partyArgKey] !== undefined) body[partyField] = argv[partyArgKey];
  if (argv.number !== undefined) body[numberField] = argv.number;
  if (argv.date !== undefined) body.date = argv.date;
  if (argv.reference !== undefined) body.reference_number = argv.reference;
  if (argv.notes !== undefined) body.notes = argv.notes;

  let lines = [];
  if (argv.line && argv.line.length) {
    lines = argv.line.map(parseLine);
  } else if (argv.item !== undefined || argv.account !== undefined || argv.rate !== undefined || argv.description !== undefined) {
    const l = {};
    if (argv.item !== undefined) l.item_id = argv.item;
    if (argv.account !== undefined) l.account_id = argv.account;
    if (argv.description !== undefined) l.description = argv.description;
    if (argv.quantity !== undefined) l.quantity = argv.quantity;
    if (argv.rate !== undefined) l.rate = argv.rate;
    lines = [l];
  }
  if (lines.length) body.line_items = lines;
  return body;
}

/** Register stop/resume commands for a recurring-profile resource. */
export function addRecurringCommands(yargs, { namespace, label }) {
  const idPos = (y) => y.positional('id', { describe: `${label} id`, type: 'string' });
  yargs
    .command('stop <id>', 'Stop the recurring profile', (y) => idPos(y), safe(async (argv) => {
      await clientFor()[namespace].stop(argv.id);
      console.log(`Stopped ${label} ${argv.id}.`);
    }))
    .command('resume <id>', 'Resume the recurring profile', (y) => idPos(y), safe(async (argv) => {
      await clientFor()[namespace].resume(argv.id);
      console.log(`Resumed ${label} ${argv.id}.`);
    }));
  return yargs;
}

/**
 * Register the standard document write + action commands on a yargs subtree.
 * @param {object} yargs
 * @param {{namespace:string,label:string,idField:string,numberField:string,partyField:string,partyArgKey:string,statuses:Array<{verb:string,state:string,desc:string,msg:(id:string)=>string}>}} spec
 */
export function addDocumentWriteCommands(yargs, spec) {
  const { namespace, label, idField, numberField, partyField, partyArgKey, statuses } = spec;
  const art = /^[aeiou]/i.test(label) ? 'an' : 'a';
  const idPos = (y) => y.positional('id', { describe: `${label} id`, type: 'string' });
  const partyOpt = (y, required) =>
    y.option(partyArgKey, { describe: `${partyArgKey === 'vendor' ? 'Vendor' : 'Customer'} id`, type: 'string', demandOption: required });

  yargs
    .command(
      'create',
      `Create ${art} ${label}`,
      (y) => partyOpt(documentFieldOptions(y), true).option('number', { describe: `${label} number (default: auto)`, type: 'string' }),
      safe(async (argv) => {
        const body = buildDocumentBody(argv, { partyField, numberField, partyArgKey });
        if (!body[partyField]) throw new Error(`--${partyArgKey} is required to create ${art} ${label}.`);
        if (!body.line_items) throw new Error('At least one line is required — pass --item/--rate or --line.');
        const rec = await clientFor()[namespace].create(body);
        if (argv.json) return void console.log(JSON.stringify(rec, null, 2));
        console.log(`Created ${label} ${rec?.[idField] ?? ''} (${rec?.status ?? ''}).`);
      }),
    )
    .command(
      'edit <id>',
      `Update ${art} ${label} (only passed flags change)`,
      (y) => partyOpt(documentFieldOptions(idPos(y)), false).option('number', { describe: `${label} number`, type: 'string' }),
      safe(async (argv) => {
        const body = buildDocumentBody(argv, { partyField, numberField, partyArgKey });
        if (Object.keys(body).length === 0) throw new Error('Nothing to update — pass at least one field flag.');
        const rec = await clientFor()[namespace].update(argv.id, body);
        if (argv.json) return void console.log(JSON.stringify(rec, null, 2));
        console.log(`Updated ${label} ${argv.id}.`);
      }),
    )
    .command(
      'delete <id>',
      `Delete ${art} ${label} (requires --yes)`,
      (y) => idPos(y).option('yes', { describe: 'Confirm deletion', type: 'boolean', alias: 'y' }),
      safe(async (argv) => {
        if (!argv.yes) throw new Error(`Refusing to delete ${label} ${argv.id} without --yes (this is destructive).`);
        await clientFor()[namespace].delete(argv.id);
        console.log(`Deleted ${label} ${argv.id}.`);
      }),
    );

  for (const s of statuses) {
    yargs.command(`${s.verb} <id>`, s.desc, (y) => idPos(y), safe(async (argv) => {
      await clientFor()[namespace].status(argv.id, s.state);
      console.log(s.msg(argv.id));
    }));
  }

  yargs
    .command('submit <id>', 'Submit for approval', (y) => idPos(y), safe(async (argv) => {
      await clientFor()[namespace].submit(argv.id);
      console.log(`Submitted ${label} ${argv.id} for approval.`);
    }))
    .command('approve <id>', 'Approve', (y) => idPos(y), safe(async (argv) => {
      await clientFor()[namespace].approve(argv.id);
      console.log(`Approved ${label} ${argv.id}.`);
    }))
    .command(
      'email <id>',
      `Email the ${label}`,
      (y) => idPos(y).option('to', { describe: 'Recipient emails (comma-separated)', type: 'string' }).option('subject', { type: 'string', describe: 'Email subject' }).option('body', { type: 'string', describe: 'Email body' }),
      safe(async (argv) => {
        const body = {};
        if (argv.to) body.to_mail_ids = String(argv.to).split(',').map((s) => s.trim()).filter(Boolean);
        if (argv.subject) body.subject = argv.subject;
        if (argv.body) body.body = argv.body;
        await clientFor()[namespace].email(argv.id, body);
        console.log(`Emailed ${label} ${argv.id}${body.to_mail_ids ? ` to ${body.to_mail_ids.join(', ')}` : ' (default recipients)'}.`);
      }),
    );

  return yargs;
}
