// @ts-check
/**
 * A chart-of-accounts (general ledger) account.
 * @typedef {Object} Account
 * @property {string} account_id
 * @property {string} account_name             Required on create
 * @property {string} [account_code]
 * @property {string} account_type             bank|cash|accounts_receivable|income|expense|cost_of_goods_sold|equity|...
 * @property {boolean} [is_active]
 * @property {string} [description]
 * @property {string} [parent_account_id]
 * @property {string} [parent_account_name]
 * @property {number} [depth]
 */
export {};
