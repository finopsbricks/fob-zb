// @ts-check
/**
 * @finopsbricks/fob-zb — the importable Zoho Books client.
 *
 * Construct a client with credentials bound once, then call resource namespaces:
 *
 *   import { fobZb } from '@finopsbricks/fob-zb';
 *   const zb = fobZb({ client_id, client_secret, refresh_token, organization_id });
 *   const { data } = await zb.organizations.list();
 *   const org = await zb.organizations.get(id);
 *
 * The `fob-zb` CLI builds the same client (see src/cli/_helpers.js `clientFor`)
 * and calls these same namespaces — so the CLI and library can never drift:
 * every endpoint is defined once, in src/resources/.
 *
 * The transport refreshes the OAuth access token on demand from the refresh
 * token; callers never mint tokens. Multi-tenant workers construct one client
 * per org: `fobZb(orgACreds)`, `fobZb(orgBCreds)`.
 *
 * @typedef {import('./types/general/index.js').ZbCredentials} Credentials
 * @typedef {import('./resources/organizations.js').OrganizationsApi} OrganizationsApi
 */

import { createTransport } from './http.js';
import { buildOrganizations } from './resources/organizations.js';
import { buildContacts } from './resources/contacts.js';
import { buildInvoices } from './resources/invoices.js';
import { buildBills } from './resources/bills.js';
import { buildExpenses } from './resources/expenses.js';
import { buildItems } from './resources/items.js';
import { buildCustomerPayments } from './resources/customer-payments.js';
import { buildChartOfAccounts } from './resources/chart-of-accounts.js';
import { buildReports } from './resources/reports.js';
import { buildBankAccounts } from './resources/bank-accounts.js';
import { buildBankTransactions } from './resources/bank-transactions.js';
import { buildVendorPayments } from './resources/vendor-payments.js';
import { buildEstimates } from './resources/estimates.js';
import { buildSalesOrders } from './resources/sales-orders.js';
import { buildCreditNotes } from './resources/credit-notes.js';
import { buildRetainerInvoices } from './resources/retainer-invoices.js';
import { buildVendorCredits } from './resources/vendor-credits.js';
import { buildPurchaseOrders } from './resources/purchase-orders.js';
import { buildRecurringInvoices } from './resources/recurring-invoices.js';
import { buildRecurringBills } from './resources/recurring-bills.js';
import { buildRecurringExpenses } from './resources/recurring-expenses.js';
import { buildJournals } from './resources/journals.js';
import { buildProjects } from './resources/projects.js';
import { buildTimeEntries } from './resources/time-entries.js';
import { buildUsers } from './resources/users.js';
import { buildTaxes } from './resources/taxes.js';
import { buildCurrencies } from './resources/currencies.js';
import { buildContactPersons } from './resources/contact-persons.js';

/**
 * @typedef {import('./resources/contacts.js').ContactsApi} ContactsApi
 * @typedef {import('./resources/invoices.js').InvoicesApi} InvoicesApi
 * @typedef {import('./resources/bills.js').BillsApi} BillsApi
 * @typedef {import('./resources/expenses.js').ExpensesApi} ExpensesApi
 * @typedef {import('./resources/items.js').ItemsApi} ItemsApi
 * @typedef {import('./resources/customer-payments.js').CustomerPaymentsApi} CustomerPaymentsApi
 * @typedef {import('./resources/chart-of-accounts.js').ChartOfAccountsApi} ChartOfAccountsApi
 * @typedef {import('./resources/reports.js').ReportsApi} ReportsApi
 * @typedef {import('./resources/bank-accounts.js').BankAccountsApi} BankAccountsApi
 * @typedef {import('./resources/bank-transactions.js').BankTransactionsApi} BankTransactionsApi
 * @typedef {import('./resources/vendor-payments.js').VendorPaymentsApi} VendorPaymentsApi
 * @typedef {import('./resources/estimates.js').EstimatesApi} EstimatesApi
 * @typedef {import('./resources/sales-orders.js').SalesOrdersApi} SalesOrdersApi
 * @typedef {import('./resources/credit-notes.js').CreditNotesApi} CreditNotesApi
 * @typedef {import('./resources/retainer-invoices.js').RetainerInvoicesApi} RetainerInvoicesApi
 * @typedef {import('./resources/vendor-credits.js').VendorCreditsApi} VendorCreditsApi
 * @typedef {import('./resources/purchase-orders.js').PurchaseOrdersApi} PurchaseOrdersApi
 * @typedef {import('./resources/recurring-invoices.js').RecurringInvoicesApi} RecurringInvoicesApi
 * @typedef {import('./resources/recurring-bills.js').RecurringBillsApi} RecurringBillsApi
 * @typedef {import('./resources/recurring-expenses.js').RecurringExpensesApi} RecurringExpensesApi
 * @typedef {import('./resources/journals.js').JournalsApi} JournalsApi
 * @typedef {import('./resources/projects.js').ProjectsApi} ProjectsApi
 * @typedef {import('./resources/time-entries.js').TimeEntriesApi} TimeEntriesApi
 * @typedef {import('./resources/users.js').UsersApi} UsersApi
 * @typedef {import('./resources/taxes.js').TaxesApi} TaxesApi
 * @typedef {import('./resources/currencies.js').CurrenciesApi} CurrenciesApi
 * @typedef {import('./resources/contact-persons.js').ContactPersonsApi} ContactPersonsApi
 */

/**
 * The Zoho Books client surface. Explicit (not inferred) so callers get a
 * checked, autocompleted surface.
 * @typedef {Object} ZbClient
 * @property {OrganizationsApi} organizations
 * @property {ContactsApi} contacts
 * @property {InvoicesApi} invoices
 * @property {BillsApi} bills
 * @property {ExpensesApi} expenses
 * @property {ItemsApi} items
 * @property {CustomerPaymentsApi} customerPayments
 * @property {ChartOfAccountsApi} chartOfAccounts
 * @property {ReportsApi} reports
 * @property {BankAccountsApi} bankAccounts
 * @property {BankTransactionsApi} bankTransactions
 * @property {VendorPaymentsApi} vendorPayments
 * @property {EstimatesApi} estimates
 * @property {SalesOrdersApi} salesOrders
 * @property {CreditNotesApi} creditNotes
 * @property {RetainerInvoicesApi} retainerInvoices
 * @property {VendorCreditsApi} vendorCredits
 * @property {PurchaseOrdersApi} purchaseOrders
 * @property {RecurringInvoicesApi} recurringInvoices
 * @property {RecurringBillsApi} recurringBills
 * @property {RecurringExpensesApi} recurringExpenses
 * @property {JournalsApi} journals
 * @property {ProjectsApi} projects
 * @property {TimeEntriesApi} timeEntries
 * @property {UsersApi} users
 * @property {TaxesApi} taxes
 * @property {CurrenciesApi} currencies
 * @property {ContactPersonsApi} contactPersons
 * @property {() => Promise<any>} whoami
 */

/**
 * @param {Credentials} credentials  Required: `{ client_id, client_secret, refresh_token, organization_id }`.
 *   Optional `region` (default 'com'), `api_domain`, cached `access_token`, and a
 *   `persistToken` callback. The library never reads these from the environment —
 *   inject them explicitly.
 * @returns {ZbClient}
 */
export function fobZb(credentials) {
  const ctx = createTransport(credentials);
  return {
    organizations: buildOrganizations(ctx),
    contacts: buildContacts(ctx),
    invoices: buildInvoices(ctx),
    bills: buildBills(ctx),
    expenses: buildExpenses(ctx),
    items: buildItems(ctx),
    customerPayments: buildCustomerPayments(ctx),
    chartOfAccounts: buildChartOfAccounts(ctx),
    reports: buildReports(ctx),
    bankAccounts: buildBankAccounts(ctx),
    bankTransactions: buildBankTransactions(ctx),
    vendorPayments: buildVendorPayments(ctx),
    estimates: buildEstimates(ctx),
    salesOrders: buildSalesOrders(ctx),
    creditNotes: buildCreditNotes(ctx),
    retainerInvoices: buildRetainerInvoices(ctx),
    vendorCredits: buildVendorCredits(ctx),
    purchaseOrders: buildPurchaseOrders(ctx),
    recurringInvoices: buildRecurringInvoices(ctx),
    recurringBills: buildRecurringBills(ctx),
    recurringExpenses: buildRecurringExpenses(ctx),
    journals: buildJournals(ctx),
    projects: buildProjects(ctx),
    timeEntries: buildTimeEntries(ctx),
    users: buildUsers(ctx),
    taxes: buildTaxes(ctx),
    currencies: buildCurrencies(ctx),
    contactPersons: buildContactPersons(ctx),
    /** The authenticated user (GET /users/me). */
    whoami: () => ctx.get('/users/me').then((r) => r?.user ?? null),
  };
}

// Transport + OAuth primitives — an escape hatch for one-off calls and the CLI's
// auth/config layer (token exchange lives in oauth.js).
export { ApiError, createTransport, MAX_ALL_ROWS } from './http.js';
export {
  OAuthError,
  REGIONS,
  DEFAULT_REGION,
  regionOf,
  apiBase,
  accountsBase,
  apiConsoleUrl,
  exchangeGrantCode,
  refreshAccessToken,
  revokeRefreshToken,
} from './oauth.js';
