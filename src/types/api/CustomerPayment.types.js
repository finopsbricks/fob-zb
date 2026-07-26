// @ts-check
/**
 * @typedef {Object} CustomerPayment
 * @property {string} payment_id
 * @property {string} [payment_number]
 * @property {string} date
 * @property {string} customer_id
 * @property {string} customer_name
 * @property {string} payment_mode             cash|check|creditcard|banktransfer|...
 * @property {number} amount
 * @property {number} [unused_amount]
 * @property {string} [reference_number]
 * @property {string} [invoice_numbers]
 * @property {string} [account_name]           Deposit-to account
 * @property {object[]} [applied_invoices]
 * @property {object[]} [invoices]             Allocation (single-record view)
 */
export {};
