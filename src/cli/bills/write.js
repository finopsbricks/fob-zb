// @ts-check
import { clientFor } from '../_helpers.js';
import { buildBillBody } from './_body.js';

export async function createBillHandler(argv) {
  const body = buildBillBody(argv);
  if (!body.vendor_id) throw new Error('--vendor is required to create a bill.');
  if (!body.line_items) throw new Error('At least one line is required — pass --account/--rate or --line.');

  const bill = await clientFor().bills.create(body);
  if (argv.json) return void console.log(JSON.stringify(bill, null, 2));
  console.log(`Created bill ${bill.bill_id} — ${bill.bill_number} (${bill.status}), total ${bill.total}.`);
}

export async function editBillHandler(argv) {
  const body = buildBillBody(argv);
  if (Object.keys(body).length === 0) throw new Error('Nothing to update — pass at least one field flag.');
  const bill = await clientFor().bills.update(argv.id, body);
  if (argv.json) return void console.log(JSON.stringify(bill, null, 2));
  console.log(`Updated bill ${bill.bill_id} — ${bill.bill_number}.`);
}

export async function deleteBillHandler(argv) {
  if (!argv.yes) throw new Error(`Refusing to delete bill ${argv.id} without --yes (this is destructive).`);
  await clientFor().bills.delete(argv.id);
  console.log(`Deleted bill ${argv.id}.`);
}

export async function markOpenBillHandler(argv) {
  await clientFor().bills.markOpen(argv.id);
  console.log(`Marked bill ${argv.id} as open.`);
}

export async function markVoidBillHandler(argv) {
  await clientFor().bills.markVoid(argv.id);
  console.log(`Voided bill ${argv.id}.`);
}
