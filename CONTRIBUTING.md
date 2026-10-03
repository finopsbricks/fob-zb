# Contributing to fob-zb

Thanks for helping. Bug reports, missing-resource requests and pull requests are all welcome.

## Before you open an issue

- Run with `FOB_DEBUG=1` and include the command and error output.
- **Remove secrets first.** Never paste a client secret, refresh token, access token or grant
  code. Organization IDs and resource IDs are fine.
- Say which data center (`--region`) your Zoho Books account is in.

## Development

```bash
npm install
npm test          # jest (ESM)
npm run typecheck # tsc against jsconfig (@ts-check)
```

- Source is plain JavaScript with JSDoc types and `// @ts-check`.
- The library (`src/resources/`, `src/http.js`, `src/oauth.js`) never reads the environment or
  the config file. Credential resolution lives in the CLI layer (`src/cli/config-store.js`).
- Each CLI command lives in `src/cli/<resource>/<action>.js`, with tests in
  `tests/cli/<resource>/`. Tests mock `fetch`; they never call Zoho.
- Test writes against a throwaway Zoho Books organization, never real books.

## Pull requests

- One change per pull request, with tests.
- Add a line under `## [Unreleased]` in `CHANGELOG.md`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `docs:` …).

By contributing, you agree that your contributions are licensed under the Apache-2.0 license.
