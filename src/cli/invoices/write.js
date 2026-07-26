// @ts-check
import { clientFor } from '../_helpers.js';
import { buildInvoiceBody } from './_body.js';

export async function createInvoiceHandler(argv) {
  const body = buildInvoiceBody(argv);
  if (!body.customer_id) throw new Error('--customer is required to create an invoice.');
  if (!body.line_items) throw new Error('At least one line is required — pass --item/--rate or --line.');

  const inv = await clientFor().invoices.create(body);
  if (argv.json) return void console.log(JSON.stringify(inv, null, 2));
  console.log(`Created invoice ${inv.invoice_id} — ${inv.invoice_number} (${inv.status}), total ${inv.total}.`);
}

export async function editInvoiceHandler(argv) {
  const body = buildInvoiceBody(argv);
  if (Object.keys(body).length === 0) throw new Error('Nothing to update — pass at least one field flag.');
  const inv = await clientFor().invoices.update(argv.id, body);
  if (argv.json) return void console.log(JSON.stringify(inv, null, 2));
  console.log(`Updated invoice ${inv.invoice_id} — ${inv.invoice_number}.`);
}

export async function deleteInvoiceHandler(argv) {
  if (!argv.yes) throw new Error(`Refusing to delete invoice ${argv.id} without --yes (this is destructive).`);
  await clientFor().invoices.delete(argv.id);
  console.log(`Deleted invoice ${argv.id}.`);
}

export async function markSentInvoiceHandler(argv) {
  await clientFor().invoices.markSent(argv.id);
  console.log(`Marked invoice ${argv.id} as sent.`);
}

export async function markVoidInvoiceHandler(argv) {
  await clientFor().invoices.markVoid(argv.id);
  console.log(`Voided invoice ${argv.id}.`);
}

export async function emailInvoiceHandler(argv) {
  const body = {};
  if (argv.to) body.to_mail_ids = String(argv.to).split(',').map((s) => s.trim()).filter(Boolean);
  if (argv.subject) body.subject = argv.subject;
  if (argv.body) body.body = argv.body;
  await clientFor().invoices.email(argv.id, body);
  console.log(`Emailed invoice ${argv.id}${body.to_mail_ids ? ` to ${body.to_mail_ids.join(', ')}` : ' (default recipients)'}.`);
}

export async function writeoffInvoiceHandler(argv) {
  await clientFor().invoices.writeOff(argv.id);
  console.log(`Wrote off the balance of invoice ${argv.id}.`);
}

export async function cancelWriteoffInvoiceHandler(argv) {
  await clientFor().invoices.cancelWriteOff(argv.id);
  console.log(`Cancelled write-off on invoice ${argv.id}.`);
}
