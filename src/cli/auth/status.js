import { resolveCredentials } from '../config-store.js';
import { formatField, formatDate } from '../utils/format.js';

/** Show the active identity, region, org, and access-token freshness. */
export async function authStatusHandler(argv) {
  let creds;
  try {
    creds = resolveCredentials();
  } catch (err) {
    if (argv.json) console.log(JSON.stringify({ error: err.message }, null, 2));
    else console.log(err.message);
    return;
  }

  const expiresAt = creds.access_token_expires_at || null;
  const tokenState = !creds.access_token
    ? 'none cached (refreshes on next call)'
    : expiresAt && Date.parse(expiresAt) > Date.now()
      ? `valid until ${formatDate(expiresAt)}`
      : 'expired (refreshes on next call)';

  if (argv.json) {
    console.log(
      JSON.stringify(
        {
          source: creds.source,
          profile: creds.name,
          region: creds.region,
          organization_id: creds.organization_id,
          organization_name: creds.organization_name,
          has_refresh_token: Boolean(creds.refresh_token),
          access_token_expires_at: expiresAt,
        },
        null,
        2,
      ),
    );
    return;
  }

  const w = 18;
  console.log(formatField('Source', creds.source, w));
  console.log(formatField('Profile', creds.name ?? '(env)', w));
  console.log(formatField('Region', creds.region, w));
  console.log(formatField('Org ID', creds.organization_id, w));
  console.log(formatField('Organization', creds.organization_name, w));
  console.log(formatField('Refresh token', creds.refresh_token ? 'present' : 'MISSING', w));
  console.log(formatField('Access token', tokenState, w));
}
