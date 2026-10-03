# Security policy

Please report vulnerabilities privately through GitHub's
[private vulnerability reporting](https://github.com/finopsbricks/fob-zb/security/advisories/new),
not in a public issue.

fob-zb runs on your machine and talks directly to Zoho's API. Credentials are stored in
`~/.fob/fob-zb/config.yml` (file mode 0600) or read from `FOB_ZB_*` environment variables.
They are never sent to FinOpsBricks.

If you think a credential was exposed, revoke it in the Zoho API Console for your data center.
Delete the Self Client or regenerate its secret, then generate a new grant code and re-add the
profile.
