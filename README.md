# fob-zb — Zoho Books CLI and client library

Work with your Zoho Books organization from the terminal, from an AI agent, or from Node code.
One package, two ways in:

- **The CLI** (`fob-zb`): list, inspect and update invoices, bills, contacts, bank transactions
  and 22 other resources. Scriptable output (`--json`, `--format csv`), and agent-friendly.
  → [finopsbricks.com/cli/fob-zb](https://finopsbricks.com/cli/fob-zb)
- **The library** (`import { fobZb }`): the same resources as a Node client for workers and
  automated pipelines. OAuth token refresh, organization routing and data centers are handled.
  → [Docs](https://finopsbricks.com/docs/zoho-books)

Beta. Not affiliated with or endorsed by Zoho Corporation. "Zoho" and "Zoho Books" are
trademarks of Zoho Corporation.

## Install

```bash
npm install -g @finopsbricks/fob-zb
fob-zb getting-started
```

Requires Node.js 18 or later. If you use the [`fob` dispatcher](https://www.npmjs.com/package/@finopsbricks/fob-cli),
`fob zb …` and `fob-zb …` are the same command.

## Connect your Zoho Books organization

You need a Zoho **Self Client**: a client ID, a client secret and a one-time grant code.
`fob-zb getting-started` prints these steps with the right links for your region.

1. Open the Zoho API Console **for your data center**. Use `api-console.zoho.com` (US),
   `.eu`, `.in`, `.com.au`, `.jp`, `api-console.zohocloud.ca`, `.com.cn` or `.sa`. A client only
   works in the region it was created in.
2. Choose **Get Started** (or **Add Client**) → **Self Client** → **Create**. The
   **Client Secret** tab shows the Client ID and Client Secret.
3. On the **Generate Code** tab, enter scope `ZohoBooks.fullaccess.all`, a duration of
   10 minutes and any description. Choose **Create**, pick your organization and copy the code.
4. Add a profile before the code expires. Each code works once only.

```bash
fob-zb config profiles add acme \
  --region com \
  --client-id 1000.XXXX --client-secret yyyy \
  --grant-code 1000.zzzz          # exchanged for a long-lived refresh token

fob-zb config profiles current    # confirm the profile and organization
fob-zb invoices list --status overdue
```

If your Zoho login can see one organization, the profile picks it up automatically. If it
can see several, run `fob-zb organizations list` and pass `--organization-id <id>`.

**More organizations, same login:** Zoho tokens belong to the user, not the organization.
Reuse an existing profile's credentials instead of creating another Self Client:

```bash
fob-zb config profiles add second-org --from acme --organization-id 8927xxxxxx
```

Revoking that refresh token (or deleting the Self Client) disconnects every profile that
shares it. Full guide with screenshots: [Zoho credentials](https://finopsbricks.com/docs/zoho-books/zoho-credentials).

## Use the CLI

Grammar: `fob-zb <resource> <action> [target] [options]`. Run `fob-zb <resource>` to see its
actions, or `fob-zb <resource> <action> --help` for flags.

```bash
fob-zb invoices list --status overdue
fob-zb invoices show <id>                                 # with line items
fob-zb invoices create --customer <id> --item <id> --quantity 2 --rate 5000
fob-zb contacts list --type customer
fob-zb bank-accounts list --format csv --fields account_name,account_type,balance
fob-zb vendor-payments create --vendor <id> --amount 1500 --date 2026-07-26 --paid-through <id> --bill <id>
```

Every `list` supports `--json`, `--fields`, `--format table|csv|json`, `--output <file>` and
`--page`/`--per-page`. Formats csv and json fetch every page. `--profile <name>` (alias
`--org`) switches organization for one command.

**26 resources**, all with `list` and `show`:

- **Sales/AR:** `contacts`, `estimates`, `sales-orders`, `invoices`, `recurring-invoices`,
  `credit-notes`, `retainer-invoices`, `customer-payments`
- **Purchases/AP:** `bills`, `recurring-bills`, `vendor-credits`, `purchase-orders`, `expenses`,
  `recurring-expenses`, `vendor-payments`
- **Banking:** `bank-accounts`, `bank-transactions`
- **Accounting:** `chart-of-accounts`, `journals`, `items`
- **Projects:** `projects`, `time-entries`
- **Settings:** `organizations`, `users`, `taxes`, `currencies`, `contact-persons`

**Writes** (create/edit/delete plus actions) on: `contacts`, `items`, `chart-of-accounts`,
`bank-accounts` (activate/deactivate); `invoices` (mark-sent, void, email, write-off);
`estimates`, `sales-orders`, `credit-notes`, `purchase-orders` (mark-*, submit, approve, email);
`bills` (mark-open, void); `vendor-payments` (record bill payments); `bank-transactions`
(categorize, match, exclude); `recurring-*` (stop, resume). Try writes on a test
organization first.

### With an AI agent

Agents can drive the CLI directly. Tell your agent to run `fob-zb getting-started` first. It
reports an existing setup, or walks through connecting one without inventing credentials.
For question-only agents, consider a Self Client with read-only scopes.
Guide: [Use with AI agents](https://finopsbricks.com/docs/zoho-books/cli/ai-agents).

## Use as a library

```js
import { fobZb } from '@finopsbricks/fob-zb';

const zb = fobZb({
  client_id, client_secret, refresh_token,   // OAuth (see "Connect" above)
  organization_id,                           // Zoho organization
  region: 'com',                             // data center (default 'com')
});

const { data: overdue } = await zb.invoices.list({ status: 'overdue' });
const org = await zb.organizations.get(organization_id);
```

The client refreshes the one-hour access token from the refresh token on demand. Callers never
mint tokens.

## Credentials and configuration

Precedence: `--profile` flag → `FOB_ZB_*` env → current profile in `~/.fob/fob-zb/config.yml`
(file mode 0600; override the directory with `FOB_ZB_CONFIG_DIR`).

The env path needs `FOB_ZB_CLIENT_ID`, `FOB_ZB_CLIENT_SECRET`, `FOB_ZB_REFRESH_TOKEN` and
`FOB_ZB_ORGANIZATION_ID`. `FOB_ZB_REGION` is optional. See `.env.example`.

Data centers: `com`, `eu`, `in`, `com.au`, `jp`, `ca`, `com.cn`, `sa`. The API host is taken
from the token response's `api_domain`.

Set `FOB_DEBUG=1` to see stack traces. Error messages link to
[troubleshooting](https://finopsbricks.com/docs/zoho-books/troubleshooting).

## Beta limits

- `bank-rules` and `base-currency-adjustments` are not built yet.
- `bank-transactions categorize` and `match` have not been validated against a live bank feed.
- Not yet supported: attachments and receipts, bulk operations, report endpoints, and a
  browser-based `auth login`. Some writes are also missing: `journals` create, `projects` and
  `time-entries` create, `vendor-credits` apply-to-bills, invoice `apply-credits`,
  `bank-accounts import-statement`, and create on the settings resources.

Missing something you need? [Open an issue](https://github.com/finopsbricks/fob-zb/issues).

## Develop

See [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
npm install
npm test          # jest (ESM)
npm run typecheck # tsc against jsconfig (@ts-check)
```

## License

Apache-2.0. See `LICENSE` and `NOTICE`.
