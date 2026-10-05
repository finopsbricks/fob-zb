// @ts-check
/**
 * One posted leg on an account, from `GET /chartofaccounts/transactions`.
 *
 * `debit_amount` / `credit_amount` are in the organization's base currency; the
 * document's own currency amount is in `fcy_*`. The unused side is `""`, not 0.
 * `transaction_id` is the source document's id and is shared by every leg of
 * that transaction, across accounts.
 *
 * @typedef {Object} AccountTransaction
 * @property {string} transaction_id
 * @property {string} categorized_transaction_id
 * @property {string} transaction_type           e.g. 'expense', 'bill', 'vendor_payment', 'journal'
 * @property {string} [transaction_type_formatted]
 * @property {string} transaction_date           YYYY-MM-DD
 * @property {string} account_id
 * @property {string} [customer_id]              the contact, for either side of AR/AP
 * @property {string} [payee]
 * @property {string} [description]
 * @property {string} [entry_number]
 * @property {string} [reference_number]
 * @property {string} [currency_code]
 * @property {'debit'|'credit'} debit_or_credit
 * @property {number|''} debit_amount
 * @property {number|''} credit_amount
 * @property {number|''} [fcy_debit_amount]
 * @property {number|''} [fcy_credit_amount]
 * @property {string} [offset_account_name]      unreliable; not the leg's counter-account
 */

/**
 * One account's totals over a period, from `GET /reports/generalledger`. The
 * report lists every account, including those with no activity (all zeros).
 *
 * @typedef {Object} GeneralLedgerRow
 * @property {string} account_id
 * @property {string} name
 * @property {number} debit_total
 * @property {number} credit_total
 * @property {number} balance
 * @property {boolean} [is_debit]
 */
export {};
