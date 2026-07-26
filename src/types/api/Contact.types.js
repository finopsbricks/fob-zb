// @ts-check
/**
 * A Zoho Books contact (customer or vendor). Subset the CLI surfaces.
 *
 * @typedef {Object} Contact
 * @property {string} contact_id
 * @property {string} contact_name              Required on create
 * @property {string} [company_name]
 * @property {'customer'|'vendor'} [contact_type]
 * @property {'business'|'individual'} [customer_sub_type]
 * @property {'active'|'inactive'} [status]
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [mobile]
 * @property {string} [currency_code]
 * @property {number} [outstanding_receivable_amount]
 * @property {number} [outstanding_payable_amount]
 * @property {number} [unused_credits_receivable_amount]
 * @property {number} [payment_terms]
 * @property {string} [payment_terms_label]
 * @property {object} [billing_address]
 * @property {object} [shipping_address]
 * @property {object[]} [contact_persons]
 */

export {};
