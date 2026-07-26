# fob-zb — Zoho Books CLI + Client (2-in-1)

## Status: IN PROGRESS (~75%)

Phases 0–2 complete; Phase 3 (write surface) complete for the core resources, validated live on a
throwaway test org (profile `test` → 932844403). Green: `npm test` 61/61, `npm run typecheck` clean.
Remaining: Phase 4 (remaining resources) and Phase 5 (polish, browser-loopback auth, attachments,
bulk ops). The OAuth2 client core
+ token lifecycle, config profiles, and the full **read surface** for the 9 core resources
(organizations, contacts, invoices, bills, expenses, items, customer-payments, chart-of-accounts,
bank-accounts, bank-transactions) all work end-to-end — **validated live against a real Zoho org**.
Remaining: the write surface + custom actions (Phase 3), the rest of the resources (Phase 4), and
convenience/polish incl. browser-loopback auth (Phase 5).

`@fob/zb` is the Zoho Books client library **and** the `fob-zb` CLI in one package, built to
`engineering-standards/cli/`. It wraps the Zoho Books REST API v3 behind the family-standard
`fob-zb <resource> <action> [target] [options]` grammar and the importable `fobZb(credentials)`
factory that workers use. The one thing that makes it different from every other `fob-*` wrapper:
Zoho authenticates with **OAuth2 + a refreshed access token** (Auth Pattern B), not a static
api-key/secret — so the transport layer owns token refresh, `organization_id` injection, and
multi-data-center routing.

---

## Problem Statement

FinOpsBricks treats Zoho Books as a **system of record** for accounting data. Today there is no
programmatic seam to (a) read/export contacts, invoices, bills, payments, chart-of-accounts, bank
transactions and journals for reporting/sync, (b) push transactions back in from workers, or (c)
drive banking/reconciliation ops. We want one artifact that serves both the terminal (explore,
script, feed an LLM) and workers (`import { ... } from '@fob/zb'`) with zero rewrite between
prototype and production — exactly the 2-in-1 shape the CLI standard mandates.

Zoho Books' auth is the hard part. Unlike the api-key/secret siblings (`fob-stm`, `fob-email`),
Zoho uses OAuth2: a long-lived **refresh token** minted once via user consent, exchanged for a
**1-hour access token** on demand, sent as `Authorization: Zoho-oauthtoken <token>`, scoped to an
`organization_id`, on a **region-specific** API host. All of that must live behind the standard
`getHeaders(credentials)` seam so the CLI (config-file creds) and workers (env creds) are identical
downstream.

## Proposed Solution

A standard 2-in-1 wrapper (mirrors `fob-stm` structure exactly) with an **OAuth2 transport** in
place of the api-key transport:

- **Client core** — `fobZb(credentials)` builds a credential-bound `ctx` (transport) once and hands
  it to `buildX(ctx)` resource modules (`contacts`, `invoices`, `bills`, …). Each resource file is
  the only place endpoint paths live. Workers import the factory; the CLI calls the same methods.
- **OAuth2 transport** (`src/http.js`) — resolves the region → API host + accounts server, refreshes
  the access token when missing/expiring, injects `organization_id`, sends the `Zoho-oauthtoken`
  header, unwraps the `{code, message, <resource>}` envelope, auto-paginates on
  `page_context.has_more_page`, and maps Zoho error codes → `ApiError`.
- **CLI shell** — yargs tree (`src/cli/index.js`), one file per action
  (`src/cli/<resource>/<action>.js`), `safe()` error wrapper, `clientFor()` credential binding,
  shared `format.js` helpers, `--json` on every read, column selector on every `list`.
- **Config & auth** — profiles in `~/.fob/fob-zb/config.yml` (0600). Two OAuth onboarding paths:
  self-client **grant-code paste** (Phase 1, headless) and **browser loopback** (later). Region is
  stored per profile with a default of `com` and auto-detected from the token response's
  `api_domain`.

### Key decisions (locked)

| Decision | Choice |
|---|---|
| Package | `@fob/zb`, `type: module`, `bin: { "fob-zb": "./bin/cli.js" }`, ESM, Node ≥18 |
| Deps | `yargs`, `js-yaml`, `@inquirer/prompts` (interactive `config add` / `auth login`); dev: `jest` + `@jest/globals` + `typescript` (jsconfig `@ts-check`) |
| Auth | OAuth2 (Pattern B). Refresh token stored; access token cached + auto-refreshed. Header `Authorization: Zoho-oauthtoken <token>` (**not** `Bearer`) |
| OAuth onboarding | **Both** — grant-code paste first (Phase 1), browser loopback later (Phase 5) |
| Region | **Configurable + auto-detect** — per-profile `region` (default `com`); resolve API host + accounts server from a region map; trust `api_domain` from token response |
| Scope | **Full CRUD parity** is the destination; sequenced read → write → banking → remainder |
| Config path | `~/.fob/fob-zb/config.yml` (0600), override `FOB_ZB_CONFIG_DIR` |
| Precedence | `--profile` flag > `FOB_ZB_*` env (client-id/secret/refresh-token/org-id/region) > current profile |
| Tests | Jest ESM (`node --experimental-vm-modules`), mock the resource/client layer, assert stdout/stderr/exit — mirrors `fob-stm` |

---

## Architecture & Layout

Mirror `fob-stm` precisely. Directory tree:

```
bin/
  cli.js                       # #!/usr/bin/env node → run(hideBin(process.argv))
src/
  index.js                     # fobZb(credentials) factory; exports resource namespaces + types
  http.js                      # OAuth2 transport: token refresh, org_id injection, envelope, ApiError, createTransport()
  oauth.js                     # token exchange (grant_code→tokens, refresh→access), region map, api_domain resolution
  resources/                   # SHARED layer — the only place endpoint paths live
    contacts.js  invoices.js  bills.js  expenses.js  items.js
    customer-payments.js  chart-of-accounts.js  bank-accounts.js  bank-transactions.js
    ...one file per resource (buildX(ctx) → flat method object)...
    organizations.js
  cli/
    index.js                   # yargs root: .command('<resource> <action>', ..., buildXSubcommands)
    _helpers.js                # clientFor(), safe(), paginationOptions(), validateDateRange()
    config-store.js            # ~/.fob/fob-zb/config.yml read/write, resolveCredentials(), token cache persistence
    auth/                      # login (loopback), status, refresh, logout/revoke
    config/                    # profiles: add, list, use, remove, current, refresh
    organizations/  contacts/  invoices/  bills/  expenses/  items/
    customer-payments/  chart-of-accounts/  bank-accounts/  bank-transactions/  ...
      index.js                 # buildXSubcommands(yargs): wires actions, wraps handlers in safe()
      list.js  show.js  create.js  edit.js  delete.js  <custom-action>.js
    utils/
      format.js                # copy from fob-stm: formatTable/Csv/Currency/Date/Field/PaginationHint
      list.js                  # buildColumnSelector() → --fields/--format/--output
  types/
    general/  Credentials.types.js  Transport.types.js  index.js
    api/      Contact.types.js  Invoice.types.js  Bill.types.js  Expense.types.js
              Item.types.js  CustomerPayment.types.js  Account.types.js  BankTransaction.types.js  ...
jsconfig.json                  # @ts-check gradual (checkJs:false, strict:false, skipLibCheck:true)
jest.config.cjs                # testEnvironment:node, testMatch **/tests/**/*.test.js
package.json  README.md  .env.example  .gitignore
tests/
  helpers.js                   # captureOutput(), ExitError
  cli/<resource>/<action>.test.js
  http.test.js  oauth.test.js
```

**Client core signature** (per-call credentials override seam):

```js
export function fobZb(credentials) {
  const ctx = createTransport(credentials);   // creds ?? env; owns token refresh
  return {
    organizations: buildOrganizations(ctx),
    contacts: buildContacts(ctx),
    invoices: buildInvoices(ctx),
    bills: buildBills(ctx),
    // …one namespace per resource
    whoami: () => ctx.get('/users/me').then(unwrap),
  };
}
```

---

## OAuth2 Transport (the novel part)

Everything below lives in `src/oauth.js` + `src/http.js`, behind `createTransport(credentials)`.
It is the only meaningful deviation from the api-key siblings.

### Credentials shape

```js
/** @typedef {Object} ZbCredentials
 *  @property {string}  client_id
 *  @property {string}  client_secret
 *  @property {string}  refresh_token              // long-lived, minted once via consent
 *  @property {string}  organization_id            // Zoho tenant; required query param on ~every call
 *  @property {string}  [region]                   // 'com'|'eu'|'in'|'com.au'|'jp'|'ca'|'com.cn'|'sa'  (default 'com')
 *  @property {string}  [api_domain]               // cached from token response; overrides region-derived host
 *  @property {string}  [access_token]             // cached; auto-refreshed
 *  @property {string}  [access_token_expires_at]  // ISO; refresh when now >= expires_at - 60s
 */
```

### Region map (`src/oauth.js`)

Each region is an independent tenant: the API host **and** the accounts (OAuth) host must match or
Zoho returns `INVALID_TOKEN`.

| region | API base (`api_domain`) | Accounts server |
|---|---|---|
| `com` | `https://www.zohoapis.com` | `https://accounts.zoho.com` |
| `eu` | `https://www.zohoapis.eu` | `https://accounts.zoho.eu` |
| `in` | `https://www.zohoapis.in` | `https://accounts.zoho.in` |
| `com.au` | `https://www.zohoapis.com.au` | `https://accounts.zoho.com.au` |
| `jp` | `https://www.zohoapis.jp` | `https://accounts.zoho.jp` |
| `ca` | `https://www.zohoapis.ca` | `https://accounts.zohocloud.ca` |
| `com.cn` | `https://www.zohoapis.com.cn` | `https://accounts.zoho.com.cn` |
| `sa` | `https://www.zohoapis.sa` | `https://accounts.zoho.sa` |

API paths are relative to `{api_domain}/books/v3`. **Auto-detect:** prefer `api_domain` from the
token response over the region-derived host; on the auth-code redirect Zoho appends
`location=`/`accounts-server=` to identify the DC.

### Token lifecycle

1. **Onboarding (one-time):** obtain a `refresh_token`.
   - *Self-client (Phase 1):* user creates a Self Client in `api-console.zoho.com`, picks scopes +
     duration, generates a **grant code**; CLI exchanges it: `POST {accounts}/oauth/v2/token`
     `grant_type=authorization_code&client_id&client_secret&code&redirect_uri` → `{ refresh_token,
     access_token, api_domain, expires_in }`. Store `refresh_token` + `api_domain`.
   - *Browser loopback (Phase 5):* open `{accounts}/oauth/v2/auth?response_type=code&access_type=offline
     &client_id&scope&redirect_uri=http://localhost:<port>/callback&prompt=consent`; catch the code
     on a temp localhost server; exchange as above.
2. **Per call:** if `access_token` missing or `now >= expires_at - 60s`, refresh:
   `POST {accounts}/oauth/v2/token` `grant_type=refresh_token&refresh_token&client_id&client_secret`
   → `{ access_token, expires_in (3600), api_domain }`. Cache `access_token` +
   `access_token_expires_at = now + expires_in`.
   - **CLI creds** (from config file): persist the refreshed access token + expiry back to
     `~/.fob/fob-zb/config.yml` so subsequent invocations reuse it within the hour.
     **Worker creds** (from env / override): cache in-memory only (no file to write).
3. **Send:** `Authorization: Zoho-oauthtoken <access_token>`, and inject
   `organization_id=<org>` into the query string of every request.
4. **401 / INVALID_TOKEN:** force one refresh + retry; if it still fails, throw `ApiError`.

Scopes: default `ZohoBooks.fullaccess.all`; document granular `ZohoBooks.{module}.{READ|…|ALL}`
for least-privilege. Refresh tokens: no expiry until revoked; max 20 active per user.

### Request/response conventions

- **Envelope:** every response is `{ code, message, page_context?, <resource_key> }`. `code:0` =
  success; non-zero → `ApiError(message, { code, status })`. Prefer `message` over bare HTTP status.
  `unwrap(r)` returns the resource-named payload (`r.invoice`, `r.contacts`, …).
- **Pagination:** `page` + `per_page` (default & max 200). `page_context.has_more_page` drives
  `apiGetAll` (walk pages, concat, safety cap → stderr notice). `list` shows a `formatPaginationHint`.
- **Bodies:** raw JSON with `Content-Type: application/json` on create/update. Attachments/receipts
  → `multipart/form-data`.
- **Rate limits:** ~100 req/min/org; HTTP 429 (codes 44/45, 1070 concurrency). Backoff + limited
  retry on 429 in the transport; surface a clear message if exhausted.
- **HTTP verbs:** GET/POST/PUT/DELETE (Zoho uses **PUT** for updates, not PATCH).

---

## Config Model & Auth Commands

### `~/.fob/fob-zb/config.yml` (mode 0600)

```yaml
current_profile: acme
profiles:
  acme:
    region: com
    api_domain: https://www.zohoapis.com     # cached from token response
    organization_id: "8927... "
    organization_name: Acme Inc               # cached (display only) via /organizations
    client_id: "1000.XXXXX"
    client_secret: "yyyy"                      # secret
    refresh_token: "1000.aaaa.bbbb"            # secret, long-lived
    access_token: "1000.cccc.dddd"             # secret, cached, auto-refreshed
    access_token_expires_at: "2026-07-26T15:04:05Z"
```

**Env vars (worker / no-config path):** `FOB_ZB_CLIENT_ID`, `FOB_ZB_CLIENT_SECRET`,
`FOB_ZB_REFRESH_TOKEN`, `FOB_ZB_ORGANIZATION_ID`, `FOB_ZB_REGION`. **Precedence:** `--profile` flag
> env (when the required set is present) > `current_profile`. Print a one-time stderr hint naming
the active identity's source. Never log secrets.

### Auth surface

```
fob-zb config profiles add <name>     # interactive: region, client-id/secret, org-id, grant-code → exchange → store
fob-zb config profiles list           # table with current-* marker + config: <path> footer
fob-zb config profiles use <name>
fob-zb config profiles remove <name>
fob-zb config profiles current
fob-zb config profiles refresh <name> # re-sync org name / api_domain from server
fob-zb auth login [--profile <n>]     # browser loopback consent (Phase 5)
fob-zb auth status [--profile <n>]    # org id/name, region, token expiry, scopes
fob-zb auth refresh [--profile <n>]   # force access-token refresh now
fob-zb auth logout [--profile <n>]    # revoke refresh token at {accounts}/oauth/v2/token/revoke
```

`config profiles add` never blocks credential save on a network fetch — store creds, warn on
stderr, fill `organization_name` on the next successful call. If `organization_id` is unknown at
add-time, run `organizations list` (after the first token) to pick it.

---

## Resource → CLI Grammar Mapping

Grammar: `fob-zb <resource> <action> [target] [options]`. Resources are plural, kebab-case. CRUD is
uniform across Zoho, so `list / show / create / edit / delete` map cleanly; custom actions become
extra subcommands (never a flag on `show`). `--json` on every read; `--fields/--format/--output` on
every `list`; `PUT` under the hood for `edit`.

### Sales & receivables
| Resource | Endpoint | Actions beyond list/show/create/edit/delete |
|---|---|---|
| `contacts` | `/contacts` | `activate`,`deactivate`, `email`, `statement`, `enable-portal`/`disable-portal`, `enable-reminders`/`disable-reminders`, `unpaid-invoices`; `--type customer\|vendor` filter |
| `contact-persons` | `/contacts/contactpersons` | `mark-primary`, `invite` |
| `estimates` | `/estimates` | `mark-sent`/`mark-accepted`/`mark-declined`, `submit`,`approve`, `email`, `pdf` |
| `sales-orders` | `/salesorders` | `mark-open`/`mark-void`, `submit`,`approve`, `email`, `pdf` |
| `invoices` | `/invoices` | `mark-sent`/`mark-void`/`mark-draft`, `submit`,`approve`, `email`, `remind`, `writeoff`/`cancel-writeoff`, `apply-credits`, `payments`, `pdf` |
| `recurring-invoices` | `/recurringinvoices` | `stop`,`resume`, `child-invoices` |
| `credit-notes` | `/creditnotes` | `mark-open`/`mark-void`, `submit`,`approve`, `email`, `apply-to-invoices`, `refund` |
| `retainer-invoices` | `/retainerinvoices` | `mark-sent`/`mark-void`, `submit`,`approve`, `email` |
| `customer-payments` | `/customerpayments` | `refund` |

### Purchases & payables
| Resource | Endpoint | Actions |
|---|---|---|
| `expenses` | `/expenses` | `receipt` (upload/get/delete), attachment |
| `recurring-expenses` | `/recurringexpenses` | `stop`,`resume`, `child-expenses` |
| `bills` | `/bills` | `mark-open`/`mark-void`, `submit`,`approve`, `apply-credits`, `payments` (record payment → via `vendor-payments create`) |
| `recurring-bills` | `/recurringbills` | `stop`,`resume` |
| `vendor-payments` | `/vendorpayments` | `refund` |
| `vendor-credits` | `/vendorcredits` | `mark-open`/`mark-void`, `submit`,`approve`, `apply-to-bills`, `refund` |
| `purchase-orders` | `/purchaseorders` | `mark-open`/`mark-billed`/`mark-cancelled`, `submit`,`approve`,`reject`, `email`, `pdf` |
| `items` | `/items` | `activate`,`deactivate`, `add-to-portal`,`remove-from-portal` |

### Banking
| Resource | Endpoint | Actions |
|---|---|---|
| `bank-accounts` | `/bankaccounts` | `activate`,`deactivate`, `transactions`, `balances`, `import-statement`, `reconciliations` |
| `bank-transactions` | `/banktransactions` | `match`,`unmatch`, `categorize` (`--as expense\|vendor-payment\|customer-payment\|transfer\|…`), `uncategorize`, `exclude`,`restore`; `list --status uncategorized --account-id` |
| `bank-rules` | `/bankaccounts/rules` | `reorder`, `skip-suggest` (note: nested under `/bankaccounts`) |

### Accounting
| Resource | Endpoint | Actions |
|---|---|---|
| `chart-of-accounts` | `/chartofaccounts` | `activate`,`deactivate`, `transactions` (`/chartofaccounts/accounttransactions`) |
| `journals` | `/journals` | `publish`, `submit`,`approve`,`reject`, `reverse` |
| `base-currency-adjustments` | `/basecurrencyadjustment` | `reevaluate`, `accounts`, `contacts` |

### Projects & time
| Resource | Endpoint | Actions |
|---|---|---|
| `projects` | `/projects` | `activate`,`deactivate`, `clone`, `users`, `tasks`, `invoices` |
| `time-entries` | `/projects/timeentries` | `start-timer`,`stop-timer`, `running-timer` |

### Settings & admin
| Resource | Endpoint | Notes |
|---|---|---|
| `organizations` | `/organizations` | `list`/`show`; **used during setup to discover `organization_id`** |
| `users` | `/users` | `activate`,`deactivate`, `invite`, `me` |
| `taxes` | `/settings/taxes` | + `tax-groups` (`/settings/taxgroups`), `tax-authorities`, `tax-exemptions` |
| `currencies` | `/settings/currencies` | + exchange rates `/settings/currencies/{id}/exchangerates` |

**Gotchas baked into the mapping** (from API research): bank rules live under `/bankaccounts/rules`;
time entries under `/projects/timeentries`; recording a bill payment is a `vendor-payments create`,
not a `/bills` action; custom-field update endpoints use the **singular** segment
(`/invoice/{id}/customfields`) except credit notes (plural); doc slugs are hyphenated but endpoint
paths are not (`/chartofaccounts`); region-gated fields (India GST, GCC/UK VAT, MX CFDI) are optional.

---

## Core Data Models (typed in `src/types/api/`)

Required-on-create + status enums to encode as JSDoc typedefs and validate/hint in create handlers.

- **Contact** — PK `contact_id`; req `contact_name` (+`contact_type` `customer|vendor`); `status`
  `active|inactive`; nested `contact_persons[]`, `billing_address`/`shipping_address`; balances read-only.
- **Invoice** — PK `invoice_id`; req `customer_id`,`line_items`; `status`
  `draft|sent|viewed|overdue|paid|partially_paid|unpaid|void` (auto); `line_items[]`
  `{item_id,name,quantity,rate,tax_id,account_id,item_total}`.
- **Bill** — PK `bill_id`; req `vendor_id`,`line_items`; `status` `draft|open|overdue|paid|void`;
  `line_items[].account_id` = **expense/GL account** (key distinction from invoices).
- **Expense** — PK `expense_id`; req `account_id`(expense),`date`,`amount`; `paid_through_account_id`;
  `status` `unbilled|invoiced|reimbursed|billed|non-billable`; `is_billable`.
- **Item** — PK `item_id`; req `name`,`rate`; `product_type` `goods|service|…`; `item_type`
  `sales|purchases|sales_and_purchases|inventory`; `account_id` income, `purchase_account_id` COGS.
- **CustomerPayment** — PK `payment_id`; req `customer_id`,`payment_mode`,`amount`,`date`,`invoices[]`;
  `invoices[]` allocation `{invoice_id, amount_applied}`.
- **Account (chart-of-accounts)** — PK `account_id`; req `account_name`,`account_type`
  (`bank|cash|accounts_receivable|income|expense|cost_of_goods_sold|equity|…`); `parent_account_id`.
- **BankTransaction** — PK `transaction_id`; req `transaction_type`,`amount`,`date`; `status`
  `uncategorized|categorized|matched|excluded`; funds via `account_id`/`from_account_id`/`to_account_id`.

Validation messages use the CLI's own vocabulary (the user typed `--customer`, error says `--customer`,
even though the API field is `customer_id`).

---

## Implementation Phases

### Phase 0: Scaffold ✅
- [x] `package.json` (`@fob/zb`, ESM, bin, deps, `test`/`typecheck` scripts), `jsconfig.json`, `jest.config.cjs`, `.gitignore`, `.env.example`
- [x] `bin/cli.js` → `run(hideBin(process.argv))`
- [x] `format.js`, `list.js` (column selector), `_helpers.js` (`safe()`, `clientFor()`), test `helpers.js` (`captureOutput`)
- [x] `src/cli/index.js` yargs root (`--profile` global, `.strict().demandCommand().help().version()`)
- [x] `src/types/general/` (Credentials, Transport)

### Phase 1: OAuth transport + config + auth ✅
- [x] `src/oauth.js` — region map, grant-code exchange, refresh-token exchange, revoke, `api_domain` resolution
- [x] `src/http.js` — `createTransport(credentials)`: token refresh + cache, `Zoho-oauthtoken` header, `organization_id` injection, envelope unwrap (`code !== 0`), `ApiError`, 401-retry, 429 backoff, `getAll` (`has_more_page`)
- [x] `src/cli/config-store.js` — `~/.fob/fob-zb/config.yml` r/w (0600), `resolveCredentials()` (flag > env > current), access-token persistence via `updateProfileTokens`
- [x] `config profiles add|list|use|remove|current|refresh` (grant-code paste onboarding)
- [x] `auth status|refresh|logout`
- [x] `organizations list|show` (bootstrap `organization_id`) + `whoami`/`/users/me`
- [x] Tests: `oauth.test.js`, `http.test.js` (refresh, cache reuse, header, org_id, envelope, 401 retry, pagination, persistToken), `config-store.test.js` (precedence), `organizations/list.test.js`. 20/20 green; typecheck clean.

**Phase 1 note:** usage errors exit 1 (not 2) — matches the reference sibling `fob-stm`, whose
identical yargs setup also exits 1. The standard's "exit 2" is unrealized by the references, so
`fob-zb` stays consistent with the family rather than diverging.

### Phase 2: Read surface — core resources ✅
`list` (+ column selector, pagination, `--json/--format/--output`) and `show` for:
- [x] `contacts` · `invoices` · `bills` · `expenses` · `items`
- [x] `customer-payments` · `chart-of-accounts` · `bank-accounts` · `bank-transactions`
- [x] `resources/*.js` `buildX(ctx)` (via shared `_base.js`); `types/api/*.types.js`; shared `cli/utils/list-runner.js`
- [x] Tests (runList unit + filter-mapping handler tests) and a live smoke test of all 9 resources

**Phase 2 notes:**
- Added `resources/_base.js` (uniform list/getAll/get) and `cli/utils/list-runner.js` (shared
  table/csv/json/output/pagination) to keep 9 resources DRY and consistent.
- **Zoho contacts filter quirk** (found live): `filter_by` is a single dimension —
  `Status.Customers`/`Status.Vendors` (type) vs `Status.Active`/`Status.Inactive` (status) — so
  `--type` and `--status` are mutually exclusive; passing both is rejected rather than silently
  returning wrong rows.
- Per-resource `filter_by` casing varies (e.g. invoices `Status.OverDue`, bills `Status.Overdue`);
  each list handler carries an explicit status→filter map.
- Handler tests cover the distinct per-resource filter logic + the shared runList; the thin
  identical resources (expenses/items/bank-accounts/customer-payments) lean on the runList test.

### Phase 3: Write surface + custom actions (core) ✅
- [x] `resources/_base.js` `writeResource` (create/update/delete) + `cli/utils/write-commands.js` `makeWriteHandlers` factory
- [x] **contacts** create/edit/delete/activate/deactivate (bespoke reference) + `--yes` delete guard
- [x] **items / chart-of-accounts / bank-accounts** create/edit/delete/activate/deactivate (via factory)
- [x] **invoices** create (line items via `--item/--rate` or repeatable `--line`), edit, delete, mark-sent, mark-void, email, writeoff, cancel-writeoff
- [x] **bills** create (account_id line items), edit, delete, mark-open, mark-void
- [x] **vendor-payments** (NEW resource) list/show/create/delete — records bill payments (`--bill`/`--apply`, `--paid-through`)
- [x] **bank-transactions** categorize/match/unmatch/uncategorize/exclude/restore + manual create/delete
- [ ] Deferred: contacts `email`/`statement`; invoices `apply-credits`, `submit`/`approve`; bank-accounts `import-statement`

**Phase 3 notes:**
- Write testing runs against a **dedicated throwaway org** (profile `test` → 932844403), never the
  real books — the shared refresh token reaches it (same login). Every write lifecycle below was
  run end-to-end **then cleaned up**: contacts, items, chart-of-accounts, bank-accounts (full
  CRUD+status), invoices (create→sent→writeoff→cancel→void→delete), bills+vendor-payments
  (create bill→record payment→bill goes to paid/0.00→delete).
- Live-learned Zoho quirks: **bills require `bill_number`** (no auto-numbering like invoices);
  contacts email/phone map onto a primary `contact_persons[]`; vendor payments need a real
  cash/bank paying account.
- **bank-transactions categorize/match**: endpoints + arg/body mapping are implemented and
  unit-tested, but categorize/match operate on *uncategorized bank-feed* items — a fresh test org
  has none, so they are **not live-validated**. `--field key=value` keeps values as strings on
  purpose (19-digit Zoho ids overflow `Number`). Manual `create` failed live with "Account does
  not exist" (needs an established account/offset), so it's shipped but not live-validated.
- Invoice `email` implemented but not fired live (avoids sending real mail).

### Phase 4: Remaining resources (full parity) ❌
- [ ] `estimates` · `sales-orders` · `credit-notes` · `retainer-invoices` · `recurring-invoices`
- [ ] `recurring-expenses` · `recurring-bills` · `vendor-payments` · `vendor-credits` · `purchase-orders`
- [ ] `journals` · `base-currency-adjustments` · `bank-rules`
- [ ] `projects` · `time-entries` · `users` · `taxes`/`tax-groups` · `currencies`
- [ ] `contact-persons`

### Phase 5: Convenience & polish ❌
- [ ] `auth login` browser loopback flow
- [ ] Attachments/receipts (`multipart/form-data`) across resources; bulk ops (bulk delete/status/pdf)
- [ ] Reports endpoints (if needed)
- [ ] README (library + CLI + credential onboarding walkthrough), `--help` copy review
- [ ] `npm run typecheck` clean; test coverage on handlers (call, output, `--json`, error path)

## Open Questions / To Confirm During Build
- Exact scope string default (`ZohoBooks.fullaccess.all`) vs shipping a least-privilege preset.
- Whether to expose a domain alias `customers`/`vendors` over `contacts --type`, or keep `contacts` only.
- Custom-field update endpoint singular/plural quirk — verify against live API when implementing edit.
- Redirect URI convention for self-client exchange (Zoho requires one even for paste flow).

## Related Files
- `engineering-standards/cli/` — authoritative CLI spec (structure, grammar, auth Pattern B, output, errors, testing)
- `finopsbricks/cli/fob-stm/` — closest sibling; copy `format.js`, `_helpers.js`, `config-store.js` shape, test harness
- `finopsbricks/cli/fob-email/` — 2-in-1 + protocol-transport reference
- `finopsbricks/cli/fob-cli/docs/wip/cli-industry-research/token-types-and-lifecycle.md` — token lifecycle rationale (OAuth = the good end of the spectrum)
- Zoho Books API v3 docs: introduction, oauth, pagination, errors, and per-resource pages (paths mapped above)
