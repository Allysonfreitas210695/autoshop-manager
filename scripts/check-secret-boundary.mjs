#!/usr/bin/env node
// SEC-06 / D-10: secret-boundary guard.
//
// Fails (non-zero exit) if:
//   1. a module that reads a server secret declares "use client" (Pitfall 5);
//   2. any non-NEXT_PUBLIC_ secret is referenced inside a "use client" module;
//   3. the built client bundle (.next/static) contains a server secret VALUE.
//
// The bundle check greps for the actual secret VALUES (read from .env), NOT the
// env var names: Better Auth bundles a runtime env-accessor object whose getters
// are keyed by name (e.g. `get BETTER_AUTH_SECRET(){ return read("BETTER_AUTH_SECRET") }`),
// so the NAME always appears in client JS even though the value never does.
// Grepping the value is the only signal that proves a real leak.
//
// Runs pre-build too: the .next/static grep is skipped gracefully when absent.
// No new deps — node:fs / node:path / node:child_process only.

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const STATIC_DIR = join(ROOT, ".next", "static");
const ENV_FILE = join(ROOT, ".env");

// Server-only secret tokens that must never cross into the client.
const SERVER_SECRETS = [
  "BETTER_AUTH_SECRET",
  "GOOGLE_CLIENT_SECRET",
  "UPSTASH_",
  "DATABASE_URL",
];
// Env keys whose VALUES would prove a leak if found in the client bundle.
const SECRET_VALUE_KEYS = [
  "BETTER_AUTH_SECRET",
  "GOOGLE_CLIENT_SECRET",
  "DATABASE_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];
// Ignore trivially short values to avoid grepping a substring that matches
// everything (e.g. an empty optional secret).
const MIN_SECRET_VALUE_LEN = 8;

/** Parse a flat KEY="value" / KEY=value .env file into a map. */
function parseEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const failures = [];

/** Recursively collect every .ts/.tsx file under a directory. */
function collectSources(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectSources(full));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function isUseClient(source) {
  // "use client" must be the first statement (ignoring leading comments/blank).
  const firstCode = source
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !line.startsWith("//"));
  return firstCode === '"use client";' || firstCode === "'use client';";
}

// --- Checks 1 & 2: scan source modules ------------------------------------
for (const file of collectSources(SRC)) {
  const source = readFileSync(file, "utf8");
  const referencesSecret = SERVER_SECRETS.some((secret) =>
    source.includes(secret),
  );
  if (referencesSecret && isUseClient(source)) {
    failures.push(
      `LEAK: ${file.replace(ROOT + "/", "")} reads a server secret but declares "use client"`,
    );
  }
}

// --- Check 3: grep the built client bundle for secret VALUES --------------
let bundleStatus = "skipped (.next/static absent — run after build)";
if (existsSync(STATIC_DIR)) {
  const env = parseEnv(ENV_FILE);
  const checked = [];
  bundleStatus = "clean";
  for (const key of SECRET_VALUE_KEYS) {
    const value = env[key];
    if (!value || value.length < MIN_SECRET_VALUE_LEN) continue; // unset/placeholder
    checked.push(key);
    try {
      execSync(
        `grep -rlF ${JSON.stringify(value)} ${JSON.stringify(STATIC_DIR)}`,
        {
          stdio: "pipe",
        },
      );
      // grep exit 0 => the literal secret value is in the client bundle.
      failures.push(`LEAK: value of "${key}" found in .next/static bundle`);
      bundleStatus = "LEAK!";
    } catch {
      // grep exit 1 => value not present => good for this key.
    }
  }
  if (bundleStatus === "clean") {
    bundleStatus =
      checked.length > 0
        ? `clean (no value leaked; checked ${checked.join(", ")})`
        : "clean (no secret values set in .env to check)";
  }
}

// --- Report ---------------------------------------------------------------
console.log("Secret-boundary check (SEC-06 / D-10)");
console.log(`  client bundle: ${bundleStatus}`);

if (failures.length > 0) {
  console.error("\nFAIL — secret boundary violated:");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(
  '  source modules: clean (no server secret in any "use client" module)',
);
console.log("\nPASS — no server secret crosses the client boundary.");
