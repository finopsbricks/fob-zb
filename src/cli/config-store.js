/**
 * CLI credential store — reads/writes ~/.fob/fob-zb/config.yml (mode 0600) and
 * resolves which credentials the current command uses.
 *
 * Config lives under the shared family root ~/.fob/ so every fob-<tool> wrapper
 * keeps its config in one place. Path is home-dir based (os.homedir()) for
 * multi-OS support; not XDG. Override the whole dir with FOB_ZB_CONFIG_DIR.
 *
 * A profile holds the Zoho OAuth2 credential set plus cached, non-secret metadata
 * (region, api_domain, organization_name) and the cached access token, which the
 * transport refreshes and persists back here via `updateProfileTokens`.
 *
 * CLI-only: the importable client (src/index.js) never imports this. CLI handlers
 * call resolveCredentials() and pass the result to fobZb() as the credentials.
 *
 * Precedence: `--profile` flag > FOB_ZB_* env (full set) > config `current_profile`.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import yaml from 'js-yaml';

import { DEFAULT_REGION } from '../oauth.js';

const CONFIG_DIR = process.env.FOB_ZB_CONFIG_DIR || join(homedir(), '.fob', 'fob-zb');
const CONFIG_PATH = join(CONFIG_DIR, 'config.yml');

/** Secret fields never shown in `profiles list` / `current`. */
const SECRET_FIELDS = ['client_secret', 'refresh_token', 'access_token'];

let profileOverride = null;

/** Set by the `--profile <name>` global flag (yargs middleware). Beats env + current_profile. */
export function setProfileOverride(name) {
  profileOverride = name;
}

export function loadConfig() {
  if (existsSync(CONFIG_PATH)) {
    const cfg = yaml.load(readFileSync(CONFIG_PATH, 'utf8')) || {};
    return { current_profile: cfg.current_profile ?? null, profiles: cfg.profiles ?? {} };
  }
  return { current_profile: null, profiles: {} };
}

export function saveConfig(cfg) {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, yaml.dump(cfg), { mode: 0o600 });
}

/** Absolute path to the config file (shown in the `profiles list` footer). */
export function configPath() {
  return CONFIG_PATH;
}

/**
 * Create or replace a profile's stored fields. Merges into any existing profile
 * so metadata (organization_name, api_domain) survives a credential update.
 */
export function addProfile(name, fields) {
  const cfg = loadConfig();
  cfg.profiles[name] = { region: DEFAULT_REGION, ...cfg.profiles[name], ...fields };
  if (!cfg.current_profile) cfg.current_profile = name;
  saveConfig(cfg);
  return cfg.profiles[name];
}

export function removeProfile(name) {
  const cfg = loadConfig();
  if (!cfg.profiles[name]) throw new Error(`No profile named '${name}'.`);
  delete cfg.profiles[name];
  if (cfg.current_profile === name) cfg.current_profile = Object.keys(cfg.profiles)[0] ?? null;
  saveConfig(cfg);
  return cfg;
}

export function useProfile(name) {
  const cfg = loadConfig();
  if (!cfg.profiles[name]) throw new Error(`No profile named '${name}'. Run \`fob-zb config profiles add ${name}\`.`);
  cfg.current_profile = name;
  saveConfig(cfg);
  return cfg;
}

/** Raw stored fields for a named profile (includes secrets — for internal use). */
export function getProfile(name) {
  const cfg = loadConfig();
  const p = cfg.profiles[name];
  if (!p) throw new Error(`No profile named '${name}'.`);
  return { ...p };
}

/**
 * Merge cached, non-secret identity/metadata into a stored profile
 * (organization_id, organization_name, api_domain). Leaves credentials untouched.
 */
export function setProfileIdentity(name, meta = {}) {
  const cfg = loadConfig();
  if (!cfg.profiles[name]) throw new Error(`No profile named '${name}'.`);
  const allowed = {};
  for (const k of ['organization_id', 'organization_name', 'api_domain', 'region']) {
    if (meta[k] !== undefined) allowed[k] = meta[k];
  }
  cfg.profiles[name] = { ...cfg.profiles[name], ...allowed };
  saveConfig(cfg);
  return cfg.profiles[name];
}

/**
 * Persist a refreshed access token (called by the transport via the
 * `persistToken` seam). Updates access_token, its expiry, and any newly-detected
 * api_domain. No-op if the profile was removed mid-run.
 */
export function updateProfileTokens(name, { access_token, access_token_expires_at, api_domain } = {}) {
  const cfg = loadConfig();
  if (!cfg.profiles[name]) return;
  cfg.profiles[name] = {
    ...cfg.profiles[name],
    access_token,
    access_token_expires_at,
    ...(api_domain ? { api_domain } : {}),
  };
  saveConfig(cfg);
}

/** Remove cached tokens from a profile (used by `auth logout`). */
export function clearProfileTokens(name) {
  const cfg = loadConfig();
  if (!cfg.profiles[name]) throw new Error(`No profile named '${name}'.`);
  const { access_token, access_token_expires_at, refresh_token, ...rest } = cfg.profiles[name];
  cfg.profiles[name] = rest;
  saveConfig(cfg);
}

/**
 * Profiles for display — non-secret metadata only.
 * @returns {{ current: string|null, path: string, profiles: object[] }}
 */
export function listProfiles() {
  const cfg = loadConfig();
  const profiles = Object.entries(cfg.profiles).map(([name, p]) => ({
    name,
    current: name === cfg.current_profile,
    region: p.region,
    organization_id: p.organization_id,
    organization_name: p.organization_name,
    has_refresh_token: Boolean(p.refresh_token),
  }));
  return { current: cfg.current_profile, path: CONFIG_PATH, profiles };
}

/** Strip secret fields from a resolved credentials object (for display). */
function scrub(creds) {
  const out = { ...creds };
  for (const k of SECRET_FIELDS) delete out[k];
  return out;
}

/**
 * Read the env credential set. Returns the credentials only when the full
 * required set is present, so a partial env never silently half-overrides a
 * profile.
 */
function envCredentials() {
  const {
    FOB_ZB_CLIENT_ID,
    FOB_ZB_CLIENT_SECRET,
    FOB_ZB_REFRESH_TOKEN,
    FOB_ZB_ORGANIZATION_ID,
    FOB_ZB_REGION,
  } = process.env;
  if (FOB_ZB_CLIENT_ID && FOB_ZB_CLIENT_SECRET && FOB_ZB_REFRESH_TOKEN && FOB_ZB_ORGANIZATION_ID) {
    return {
      client_id: FOB_ZB_CLIENT_ID,
      client_secret: FOB_ZB_CLIENT_SECRET,
      refresh_token: FOB_ZB_REFRESH_TOKEN,
      organization_id: FOB_ZB_ORGANIZATION_ID,
      region: FOB_ZB_REGION || DEFAULT_REGION,
    };
  }
  return null;
}

/**
 * Resolve credentials for the current command.
 * Precedence: `--profile` override > FOB_ZB_* env (full set) > `current_profile`.
 * @returns {object} credentials + `name` (profile name or null) + `source`
 */
export function resolveCredentials() {
  const cfg = loadConfig();

  if (profileOverride) {
    const p = cfg.profiles[profileOverride];
    if (!p) throw new Error(`Profile '${profileOverride}' is not configured. Run \`fob-zb config profiles add ${profileOverride}\`.`);
    return { ...p, name: profileOverride, source: `profile '${profileOverride}'` };
  }

  const env = envCredentials();
  if (env) return { ...env, name: null, source: 'FOB_ZB_* env' };

  if (cfg.current_profile && cfg.profiles[cfg.current_profile]) {
    return { ...cfg.profiles[cfg.current_profile], name: cfg.current_profile, source: `profile '${cfg.current_profile}'` };
  }

  throw new Error(
    'No Zoho Books profile selected. Run `fob-zb config profiles add <name>` (or set FOB_ZB_* env).',
  );
}

/**
 * Non-secret description of the identity the CLI would use right now — same
 * resolution as resolveCredentials(), minus secrets. Null when nothing is set.
 */
export function describeCurrent() {
  try {
    return scrub(resolveCredentials());
  } catch {
    return null;
  }
}
