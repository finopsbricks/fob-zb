# @fob/zb

Zoho Books client **and** the `fob-zb` CLI in one package (a 2-in-1). Import the client in a
worker, or drive the same functions from the terminal.

Built to the CLI standard: `engineering-standards/cli/`. Unlike the api-key siblings, Zoho Books
uses **OAuth2** — the client owns access-token refresh, `organization_id` injection, and
data-center routing, all behind one credentials seam.

## As a library (workers)

```js
import { fobZb } from '@fob/zb';

// Credentials from the worker's own env, or an explicit override per call.
const zb = fobZb({
  client_id, client_secret, refresh_token,   // OAuth
  organization_id,                           // Zoho tenant
  region: 'com',                             // data center (default 'com')
});

const { data: orgs } = await zb.organizations.list();   // list tenants
const org = await zb.organizations.get(organization_id);
```

The client refreshes the OAuth access token on demand (1-hour lifetime) from the refresh token —
callers never mint tokens. See `src/index.js`.

## As a CLI

```bash
# 1. Create a Self Client at api-console.zoho.com, pick scopes (ZohoBooks.fullaccess.all),
#    generate a grant code, then:
fob-zb config profiles add acme \
  --region com \
  --client-id 1000.XXXX --client-secret yyyy \
  --grant-code 1000.abc...            # exchanged for a long-lived refresh token

fob-zb config profiles use acme
fob-zb auth status                    # identity, region, token freshness

# 2. Discover your organization_id, then pin it to the profile:
fob-zb organizations list
fob-zb config profiles add acme --organization-id 8927xxxxxx

fob-zb organizations list --json
fob-zb organizations show 8927xxxxxx
```

Grammar: `fob-zb <resource> <action> [target] [options]`. Every read command supports `--json`.
`--profile <name>` (alias `--org`) overrides the current profile for one command.

### Credentials

Precedence: `--profile` flag → `FOB_ZB_*` env (full set) → current profile in
`~/.fob/fob-zb/config.yml` (mode 0600). Override the config dir with `FOB_ZB_CONFIG_DIR`.

Env set (for workers or a config-less CLI): `FOB_ZB_CLIENT_ID`, `FOB_ZB_CLIENT_SECRET`,
`FOB_ZB_REFRESH_TOKEN`, `FOB_ZB_ORGANIZATION_ID`, `FOB_ZB_REGION`. See `.env.example`.

Data centers: `com`, `eu`, `in`, `com.au`, `jp`, `ca`, `com.cn`, `sa`. The client auto-detects the
API host from the token response's `api_domain`.

## CLI surface

Meta: `config` (profiles: add/list/use/remove/current/refresh), `auth` (status/refresh/logout).

**26 resources**, all with `list` + `show` (`--json`, `--fields`, `--format table|csv|json`,
`--output`, `--page`/`--per-page`, per-resource filters):

- **Sales/AR:** `contacts`, `estimates`, `sales-orders`, `invoices`, `recurring-invoices`,
  `credit-notes`, `retainer-invoices`, `customer-payments`
- **Purchases/AP:** `bills`, `recurring-bills`, `vendor-credits`, `purchase-orders`, `expenses`,
  `recurring-expenses`, `vendor-payments`
- **Banking:** `bank-accounts`, `bank-transactions`
- **Accounting:** `chart-of-accounts`, `journals`, `items`
- **Projects:** `projects`, `time-entries`
- **Settings:** `organizations`, `users`, `taxes`, `currencies`, `contact-persons`

Write surface (create/edit/delete + custom actions) on: `contacts`, `items`, `chart-of-accounts`,
`bank-accounts` (+ activate/deactivate); `invoices` (mark-sent/void, email, writeoff),
`estimates`/`sales-orders`/`credit-notes`/`purchase-orders` (mark-*, submit, approve, email);
`bills` (mark-open/void); `vendor-payments` (record bill payments); `bank-transactions`
(categorize/match/exclude); `recurring-*` (stop/resume).

```bash
fob-zb invoices list --status overdue
fob-zb invoices show <id>                                 # with line items
fob-zb invoices create --customer <id> --item <id> --quantity 2 --rate 5000
fob-zb contacts list --type customer                      # (--type / --status mutually exclusive; Zoho limit)
fob-zb bank-accounts list --format csv --fields account_name,account_type,balance
fob-zb vendor-payments create --vendor <id> --amount 1500 --date 2026-07-26 --paid-through <id> --bill <id>
```

Run `fob-zb <resource>` to see a resource's actions, or `fob-zb <resource> <action> --help`.

## Status

Phases 0–4 complete: OAuth2 transport, config/auth, the read surface for all 26 resources, and the
write surface for the core + document resources. Read layer + core writes live-validated against a
real org; document/recurring writes validated on a throwaway test org. See
`docs/wip/fob-zb-implementation.md` for the detail and the small set of remaining items
(bank-transactions categorize/match need live bank-feed data; `bank-rules` and
`base-currency-adjustments` not yet built).

## Develop

```bash
npm install
npm test          # jest (ESM)
npm run typecheck # tsc against jsconfig (@ts-check)
```
