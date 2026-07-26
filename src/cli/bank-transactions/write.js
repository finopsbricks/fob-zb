// @ts-check
import { clientFor } from '../_helpers.js';
import { CATEGORIZE_TARGETS, mergeBody, buildTransactionBody } from './_body.js';

export async function createTransactionHandler(argv) {
  const body = buildTransactionBody(argv);
  if (!body.account_id) throw new Error('--account-id is required.');
  if (!body.transaction_type) throw new Error('--type is required.');
  if (body.amount === undefined) throw new Error('--amount is required.');
  if (!body.date) throw new Error('--date is required (YYYY-MM-DD).');

  const t = await clientFor().bankTransactions.create(body);
  if (argv.json) return void console.log(JSON.stringify(t, null, 2));
  console.log(`Created bank transaction ${t.transaction_id} (${t.transaction_type}), amount ${t.amount}.`);
}

export async function deleteTransactionHandler(argv) {
  if (!argv.yes) throw new Error(`Refusing to delete transaction ${argv.id} without --yes (this is destructive).`);
  await clientFor().bankTransactions.delete(argv.id);
  console.log(`Deleted bank transaction ${argv.id}.`);
}

export async function categorizeHandler(argv) {
  if (!(argv.as in CATEGORIZE_TARGETS)) {
    throw new Error(`Unknown --as '${argv.as}'. One of: ${Object.keys(CATEGORIZE_TARGETS).join(', ')}.`);
  }
  const target = CATEGORIZE_TARGETS[argv.as];
  const body = mergeBody(argv);
  if (!target && !body.transaction_type) body.transaction_type = argv.as; // generic form needs the type
  await clientFor().bankTransactions.categorize(argv.id, target, body);
  console.log(`Categorized bank transaction ${argv.id} as ${argv.as}.`);
}

export async function matchHandler(argv) {
  await clientFor().bankTransactions.match(argv.id, mergeBody(argv));
  console.log(`Matched bank transaction ${argv.id}.`);
}

export async function unmatchHandler(argv) {
  await clientFor().bankTransactions.unmatch(argv.id);
  console.log(`Unmatched bank transaction ${argv.id}.`);
}

export async function uncategorizeHandler(argv) {
  await clientFor().bankTransactions.uncategorize(argv.id);
  console.log(`Uncategorized bank transaction ${argv.id}.`);
}

export async function excludeHandler(argv) {
  await clientFor().bankTransactions.exclude(argv.id);
  console.log(`Excluded bank transaction ${argv.id}.`);
}

export async function restoreHandler(argv) {
  await clientFor().bankTransactions.restore(argv.id);
  console.log(`Restored bank transaction ${argv.id}.`);
}
