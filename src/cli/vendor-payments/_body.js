// @ts-check
/**
 * Vendor-payment argv→Zoho-body mapping. Pure (no client import) so tests can
 * import it without pulling in the transport.
 *
 * Bills are applied via repeatable `--apply bill_id=amount`, or a single
 * `--bill <id>` taking the full `--amount`.
 */
export function buildVendorPaymentBody(argv) {
  const body = {};
  if (argv.vendor !== undefined) body.vendor_id = argv.vendor;
  if (argv.amount !== undefined) body.amount = argv.amount;
  if (argv.date !== undefined) body.date = argv.date;
  if (argv.mode !== undefined) body.payment_mode = argv.mode;
  if (argv.paidThrough !== undefined) body.paid_through_account_id = argv.paidThrough;
  if (argv.reference !== undefined) body.reference_number = argv.reference;

  let bills = [];
  if (argv.apply && argv.apply.length) {
    bills = argv.apply.map((s) => {
      const i = String(s).indexOf('=');
      return { bill_id: String(s).slice(0, i).trim(), amount_applied: Number(String(s).slice(i + 1)) };
    });
  } else if (argv.bill !== undefined) {
    bills = [{ bill_id: argv.bill, amount_applied: argv.amount }];
  }
  if (bills.length) body.bills = bills;
  return body;
}
