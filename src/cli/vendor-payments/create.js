// @ts-check
import { clientFor } from '../_helpers.js';
import { formatCurrency } from '../utils/format.js';
import { buildVendorPaymentBody } from './_body.js';

export async function createVendorPaymentHandler(argv) {
  const body = buildVendorPaymentBody(argv);
  if (!body.vendor_id) throw new Error('--vendor is required.');
  if (body.amount === undefined) throw new Error('--amount is required.');
  if (!body.paid_through_account_id) throw new Error('--paid-through (paying account id) is required.');
  if (!body.date) throw new Error('--date is required (YYYY-MM-DD).');

  const p = await clientFor().vendorPayments.create(body);
  if (argv.json) return void console.log(JSON.stringify(p, null, 2));
  console.log(`Recorded vendor payment ${p.payment_id} — ${formatCurrency(p.amount)} to ${p.vendor_name ?? body.vendor_id}.`);
}

export async function deleteVendorPaymentHandler(argv) {
  if (!argv.yes) throw new Error(`Refusing to delete vendor payment ${argv.id} without --yes (this is destructive).`);
  await clientFor().vendorPayments.delete(argv.id);
  console.log(`Deleted vendor payment ${argv.id}.`);
}
