// @ts-check
/**
 * @typedef {Object} Invoice
 * @property {string} invoice_id
 * @property {string} invoice_number
 * @property {string} customer_id
 * @property {string} customer_name
 * @property {string} status                 draft|sent|viewed|overdue|paid|partially_paid|unpaid|void
 * @property {string} date
 * @property {string} due_date
 * @property {number} [sub_total]
 * @property {number} total
 * @property {number} balance
 * @property {string} currency_code
 * @property {string} [reference_number]
 * @property {object[]} [line_items]
 */
export {};
