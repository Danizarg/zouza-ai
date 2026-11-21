#!/usr/bin/env node
// Zouza Supabase runner: applies migrations and runs SQL tests through the Supabase Management API.
//
//   node scripts/supabase/run.mjs migrate            apply new files in supabase/migrations, in name order
//   node scripts/supabase/run.mjs test [file ...]    run supabase/tests/*.test.sql (or the given files)
//   node scripts/supabase/run.mjs types <outfile>    write generated TypeScript types for the public schema
//   node scripts/supabase/run.mjs advisors           list Supabase security and performance advisor findings
//   node scripts/supabase/run.mjs auth-config        apply Zouza's auth settings and print them back
//   node scripts/supabase/run.mjs status             applied migrations and which env vars are set
//
// Reads SUPABASE_ACCESS_TOKEN, NEXT_PUBLIC_SUPABASE_URL (and EMAIL_SMTP_* for auth-config) from the env
// file named by SUPABASE_ENV_FILE, default ./.env.local. Values are never printed.
// Tests run inside a transaction that is always rolled back, with supabase/tests/_helpers.sql prepended.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MIGRATIONS = join(ROOT, "supabase", "migrations");
const TESTS = join(ROOT, "supabase", "tests");
const API = "https://api.supabase.com/v1";

function loadEnv() {
  const file = process.env.SUPABASE_ENV_FILE || ".env.local";
  const text = readFileSync(file, "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const token = env.SUPABASE_ACCESS_TOKEN;
const ref = (env.NEXT_PUBLIC_SUPABASE_URL || "").match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
if (!token || !ref) {
  console.error("SUPABASE_ACCESS_TOKEN or NEXT_PUBLIC_SUPABASE_URL is missing from the env file");
  process.exit(1);
}
const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };

async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) {
    const msg = typeof body === "object" && body ? body.message || JSON.stringify(body) : String(body);
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }
  return body;
}

const sql = (query) => api(`/projects/${ref}/database/query`, { method: "POST", body: JSON.stringify({ query }) });

const BOOKKEEPING = `create schema if not exists private;
create table if not exists private.applied_migrations (name text primary key, applied_at timestamptz not null default now());`;

async function migrate() {
  await sql(BOOKKEEPING);
  const applied = new Set((await sql("select name from private.applied_migrations")).map((r) => r.name));
  const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort();
  let count = 0;
  for (const f of files) {
    if (applied.has(f)) continue;
    const body = readFileSync(join(MIGRATIONS, f), "utf8");
    const name = f.replace(/'/g, "''");
    try {
      await sql(`begin;\n${body}\n;insert into private.applied_migrations(name) values ('${name}');\ncommit;`);
    } catch (e) {
      console.error(`FAILED ${f}: ${e.message}`);
      process.exit(1);
    }
    console.log(`applied ${f}`);
    count++;
  }
  if (!count) console.log("nothing to apply");
}

async function test(paths) {
  const helpers = readFileSync(join(TESTS, "_helpers.sql"), "utf8");
  const files = paths.length
    ? paths.map((p) => resolve(p))
    : readdirSync(TESTS).filter((f) => f.endsWith(".test.sql")).sort().map((f) => join(TESTS, f));
  let failed = 0;
  for (const file of files) {
    const body = readFileSync(file, "utf8");
    const label = file.startsWith(ROOT) ? file.slice(ROOT.length + 1).replace(/\\/g, "/") : file;
    try {
      await sql(`begin;\n${helpers}\n${body}\n;rollback;`);
      console.log(`PASS ${label}`);
    } catch (e) {
      failed++;
      console.log(`FAIL ${label}: ${e.message}`);
    }
  }
  console.log(`${files.length - failed}/${files.length} test files passed`);
  if (failed) process.exitCode = 1;
}

async function types(out) {
  if (!out) { console.error("usage: types <outfile>"); process.exit(1); }
  const body = await api(`/projects/${ref}/types/typescript?included_schemas=public`);
  writeFileSync(out, body.types);
  console.log(`wrote ${basename(out)} (${body.types.length} chars)`);
}

async function advisors() {
  for (const kind of ["security", "performance"]) {
    const body = await api(`/projects/${ref}/advisors/${kind}`);
    const lints = body.lints || [];
    console.log(`== ${kind}: ${lints.length}`);
    for (const l of lints) {
      const where = l.metadata ? [l.metadata.schema, l.metadata.name].filter(Boolean).join(".") : "";
      console.log(`${l.level}\t${l.name}\t${where}\t${(l.detail || "").replace(/\s+/g, " ").slice(0, 160)}`);
    }
  }
}

// Zouza auth settings (design 2026-11-21): confirmation emails from info@zouza.ai through the existing
// mailbox, links straight back to the app (zouza:// in builds, exp:// in Expo Go until launch).
const AUTH_SETTINGS = {
  site_url: "https://zouza.ai",
  uri_allow_list: "zouza://**,exp://**",
  mailer_autoconfirm: false,
  external_anonymous_users_enabled: false,
  password_min_length: 8,
  smtp_admin_email: "info@zouza.ai",
  smtp_sender_name: "Zouza",
  rate_limit_email_sent: 30,
};

async function authConfig() {
  for (const k of ["EMAIL_SMTP_HOST", "EMAIL_SMTP_PORT", "EMAIL_SMTP_USER", "EMAIL_SMTP_PASS"]) {
    if (!env[k]) { console.error(`${k} is empty in the env file`); process.exitCode = 1; return; }
  }
  // The PATCH response is the applied config; a GET right after can still return the old values.
  const c = await api(`/projects/${ref}/config/auth`, {
    method: "PATCH",
    body: JSON.stringify({
      ...AUTH_SETTINGS,
      smtp_host: env.EMAIL_SMTP_HOST,
      smtp_port: String(env.EMAIL_SMTP_PORT),
      smtp_user: env.EMAIL_SMTP_USER,
      smtp_pass: env.EMAIL_SMTP_PASS,
    }),
  });
  for (const k of [...Object.keys(AUTH_SETTINGS), "smtp_host", "smtp_port", "smtp_user"]) {
    console.log(`${k}: ${JSON.stringify(c[k])}`);
  }
  console.log(`smtp_pass: ${c.smtp_pass ? "set" : "empty"}`);
}

async function status() {
  for (const k of ["SUPABASE_ACCESS_TOKEN", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "EMAIL_SMTP_HOST", "EMAIL_SMTP_PORT", "EMAIL_SMTP_USER", "EMAIL_SMTP_PASS"]) {
    console.log(`${k}: ${env[k] ? "set" : "empty"}`);
  }
  await sql(BOOKKEEPING);
  const rows = await sql("select name, applied_at from private.applied_migrations order by name");
  console.log(rows.length ? rows.map((r) => `applied ${r.name}  ${r.applied_at}`).join("\n") : "no migrations applied");
}

const [cmd, ...rest] = process.argv.slice(2);
const commands = { migrate, test: () => test(rest), types: () => types(rest[0]), advisors, "auth-config": authConfig, status };
if (!commands[cmd]) {
  console.error("usage: run.mjs migrate | test [file ...] | types <outfile> | advisors | auth-config | status");
  process.exit(1);
}
commands[cmd]().catch((e) => { console.error(e.message); process.exit(1); });
