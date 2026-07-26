import { safe, paginationOptions, listOutputOptions } from '../_helpers.js';
import { listBankTransactionsHandler } from './list.js';
import { showBankTransactionHandler } from './show.js';
import { CATEGORIZE_TARGETS } from './_body.js';
import {
  createTransactionHandler,
  deleteTransactionHandler,
  categorizeHandler,
  matchHandler,
  unmatchHandler,
  uncategorizeHandler,
  excludeHandler,
  restoreHandler,
} from './write.js';

const idPos = (y) => y.positional('id', { describe: 'Transaction id', type: 'string' });

export function buildBankTransactionsSubcommands(yargs) {
  return yargs
    .usage('$0 bank-transactions <action> [options]')
    .command(
      'list',
      'List bank / credit-card feed transactions',
      (y) =>
        listOutputOptions(paginationOptions(y))
          .option('account-id', { describe: 'Filter by bank account id', type: 'string' })
          .option('status', { describe: 'Filter by categorization status', type: 'string', choices: ['all', 'uncategorized', 'categorized', 'matched', 'excluded'] }),
      safe(listBankTransactionsHandler),
    )
    .command('show <id>', 'Show a bank transaction by id', (y) => idPos(y).option('json', { describe: 'Output raw JSON', type: 'boolean' }), safe(showBankTransactionHandler))
    .command(
      'create',
      'Manually add a bank transaction',
      (y) =>
        y
          .option('account-id', { describe: 'Bank account id', type: 'string', demandOption: true })
          .option('type', { describe: 'Transaction type (deposit, transfer_fund, card_payment, ...)', type: 'string', demandOption: true })
          .option('amount', { describe: 'Amount', type: 'number', demandOption: true })
          .option('date', { describe: 'Date (YYYY-MM-DD)', type: 'string', demandOption: true })
          .option('from-account', { describe: 'From account id (offset/source)', type: 'string' })
          .option('to-account', { describe: 'To account id (transfers)', type: 'string' })
          .option('description', { describe: 'Description', type: 'string' })
          .option('reference', { describe: 'Reference number', type: 'string' })
          .option('payment-mode', { describe: 'Payment mode', type: 'string' })
          .option('json', { describe: 'Output raw JSON', type: 'boolean' }),
      safe(createTransactionHandler),
    )
    .command('delete <id>', 'Delete a bank transaction (requires --yes)', (y) => idPos(y).option('yes', { describe: 'Confirm deletion', type: 'boolean', alias: 'y' }), safe(deleteTransactionHandler))
    .command(
      'categorize <id>',
      'Categorize an uncategorized transaction',
      (y) =>
        idPos(y)
          .option('as', { describe: 'Categorize as', type: 'string', choices: Object.keys(CATEGORIZE_TARGETS), demandOption: true })
          .option('field', { describe: 'Body field "key=value" (repeatable; ids kept as strings)', type: 'string', array: true })
          .option('json-body', { describe: 'Full JSON body (merged over --field)', type: 'string' }),
      safe(categorizeHandler),
    )
    .command(
      'match <id>',
      'Match an uncategorized transaction to existing records',
      (y) =>
        idPos(y)
          .option('field', { describe: 'Body field "key=value" (repeatable)', type: 'string', array: true })
          .option('json-body', { describe: 'Full JSON body (merged over --field)', type: 'string' }),
      safe(matchHandler),
    )
    .command('unmatch <id>', 'Remove a match', (y) => idPos(y), safe(unmatchHandler))
    .command('uncategorize <id>', 'Revert a categorization', (y) => idPos(y), safe(uncategorizeHandler))
    .command('exclude <id>', 'Exclude a transaction from books', (y) => idPos(y), safe(excludeHandler))
    .command('restore <id>', 'Restore an excluded transaction', (y) => idPos(y), safe(restoreHandler))
    .demandCommand(1, 'Specify an action: list, show, create, delete, categorize, match, unmatch, uncategorize, exclude, restore');
}
