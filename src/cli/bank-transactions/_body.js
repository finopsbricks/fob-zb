// @ts-check
/** Bank-transaction write/categorize field mapping. Pure (no client import). */

/** CLI `--as` value → Zoho categorize dedicated target (undefined = generic form). */
export const CATEGORIZE_TARGETS = {
  expense: 'expenses',
  'vendor-payment': 'vendorpayments',
  'customer-payment': 'customerpayments',
  'credit-note-refund': 'creditnoterefunds',
  'vendor-credit-refund': 'vendorcreditrefunds',
  'payment-refund': 'paymentrefunds',
  'vendor-payment-refund': 'vendorpaymentrefunds',
  transfer: undefined,
  deposit: undefined,
};

/**
 * Parse repeatable `--field key=value` into an object. Values are kept as
 * STRINGS on purpose — Zoho record ids are 19-digit numbers that Number() would
 * silently corrupt past Number.MAX_SAFE_INTEGER. Use --json-body for typed payloads.
 */
export function parseFields(arr) {
  const body = {};
  for (const s of arr ?? []) {
    const i = String(s).indexOf('=');
    if (i === -1) continue;
    const k = String(s).slice(0, i).trim();
    if (k) body[k] = String(s).slice(i + 1);
  }
  return body;
}

/** Merge --field pairs with an optional --json-body (json-body wins). */
export function mergeBody(argv) {
  let body = parseFields(argv.field);
  if (argv.jsonBody) body = { ...body, ...JSON.parse(argv.jsonBody) };
  return body;
}

/** Manual bank-transaction create body. */
export function buildTransactionBody(argv) {
  const b = {};
  if (argv.accountId !== undefined) b.account_id = argv.accountId;
  if (argv.type !== undefined) b.transaction_type = argv.type;
  if (argv.amount !== undefined) b.amount = argv.amount;
  if (argv.date !== undefined) b.date = argv.date;
  if (argv.fromAccount !== undefined) b.from_account_id = argv.fromAccount;
  if (argv.toAccount !== undefined) b.to_account_id = argv.toAccount;
  if (argv.description !== undefined) b.description = argv.description;
  if (argv.reference !== undefined) b.reference_number = argv.reference;
  if (argv.paymentMode !== undefined) b.payment_mode = argv.paymentMode;
  return b;
}
