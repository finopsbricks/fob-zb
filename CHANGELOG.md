# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] - 2026-10-05

### Added
- Bank statement import (library only): `bankAccounts.importStatement({ account_id, start_date, end_date, transactions })` puts a statement's lines into a bank or card account's feed as uncategorized transactions (`POST /bankstatements`). `bankAccounts.lastImportedStatement(id)` returns the last import with its lines, and `deleteLastImportedStatement(id, statement_id)` removes it and its feed lines; repeat to walk back further.

### Notes
Verified against a live org (2026-10-05):
- **Import lines and sides:**
  - Import lines take `date`; `transaction_date` is rejected ("Invalid value passed for Date", code 4).
  - `debit_or_credit` on import is in the bank's terms (`debit` = money out). Feed lines read back from `bankTransactions` are in book terms, so the sides swap.
- **Re-imports:** an identical line is not added twice. A line that differs in any field is added as a new line.
- **`bankTransactions.list` / `getAll` need a `filter_by`:**
  - With no filter, or with `Status.All`, uncategorized lines are left out; read them with `Status.Uncategorized`.
  - A categorized line's `transaction_id` is the record it became (e.g. the vendor payment), and `imported_transaction_id` is the feed line. `uncategorize` takes the feed-line id and deletes the record it created.
- **`bankTransactions.categorize(id, 'vendorpayments', { vendor_id, amount, date, paid_through_account_id, bills: [{ bill_id, amount_applied }] })`:**
  - Applies one bank line across several bills, or part of one. `amount` must equal the feed line's amount (code 108002).
  - **Zoho applies the payment to a draft bill too, and marks it paid.** Callers that keep drafts for approval must check the bill's status themselves.

## [0.5.0] - 2026-10-05

### Added
- General ledger reads (library only): `reports.generalLedger({ from_date, to_date })` gives every account's debit and credit totals over a period in one call. `chartOfAccounts.listTransactions(account_id)` and `getAllTransactions(account_id)` give the posted legs on one account, in base currency with the foreign amount in `fcy_*`, each carrying the `transaction_id` its other legs share.
- `getAllTransactions` returns `{ data, truncated }` rather than a bare array, so a ledger read capped at `MAX_ALL_ROWS` can't pass for a complete one.

### Notes
- `/reports/generalledger` requires `from_date` (Zoho code 101007) and isn't in Zoho's public API docs. `/chartofaccounts/transactions` ignores date filters: every read is the account's whole history.

## [0.4.0] - 2026-10-03

### Added
- File uploads in the library: the transport's `upload(path, file)` sends one file as `multipart/form-data`, using Node's built-in `FormData`. It shares token refresh, the 401 retry and the 429 backoff with every other request.
- `bills.addAttachment(id, file)`: attach a PDF or image to a bill.
- `expenses.create` / `update` / `delete`, and `expenses.addReceipt(id, file)`.

### Notes
- Draft bills: pass `is_draft: true` in the `bills.create` body. Zoho ignores `status: 'draft'` and creates the bill open.

## [0.3.0] - 2026-10-03

### Changed
- `config profiles add` / `refresh`: when the Zoho login can see several organizations, list them and ask which one the profile should use (Enter picks Zoho's default org). Without a terminal, print the list and the exact `--organization-id` follow-up instead, and say the credentials are already saved, so no new grant code is needed.

## [0.2.1] - 2026-10-03

### Fixed
- `fob-zb --version` printed `unknown` when installed from npm (since 0.1.1). The version is now read from the package's own `package.json`.

## [0.2.0] - 2026-10-03

### Added
- `fob-zb getting-started`: setup walkthrough for people and AI agents. It reports an existing setup, or lists each region's Zoho API Console, the Self Client steps and the `profiles add` command.
- `config profiles add --from <profile>`: reuse another profile's OAuth credentials to add a second organization without a new Self Client.
- `apiConsoleUrl(region)` export: the region's Zoho API Console URL.
- `--help` footer with the getting-started hint and links to the docs and landing page.

### Changed
- Token errors (`invalid_code`, `invalid_client`, `invalid_grant`, other) link to the matching troubleshooting section.
- Missing-credential errors in `config profiles add` name the region-specific API Console and link the credentials guide. The no-profile error points to `getting-started`.
- README rewritten for first-time users: split into CLI and library, with step-by-step Self Client setup, multiple organizations, Beta limits and a trademark notice.
- `package.json`: `homepage`, a clearer description and keywords.

## [0.1.1] - 2026-07-29

### Changed
- Help output: each command's own options now render under `Options:` above a dedicated `Global Options:` group (`--profile`/`--org`, `--help`, `--version`), instead of being interleaved. Help text only — no behavior change.
