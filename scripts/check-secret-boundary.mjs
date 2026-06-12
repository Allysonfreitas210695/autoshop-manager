#!/usr/bin/env node
// SEC-06 / D-10: secret-boundary guard.
//
// Fails (non-zero exit) if:
//   1. a module that reads a server secret declares "use client" (Pitfall 5);
//   2. any non-NEXT_PUBLIC_ secret is referenced inside a "use client" module;
//   3. the built client bundle (.next/static) contains a server secret name.
//
// Runs pre-build too: the .next/static grep is skipped gracefully when absent.
// No new deps — node:fs / node:path / node:child_process only.

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const STATIC_DIR = join(ROOT, ".next", "static");

// Server-only secret tokens that must never cross into the client.
const SERVER_SECRETS = [
  "BETTER_AUTH_SECRET",
  "GOOGLE_CLIENT_SECRET",
  "UPSTASH_",
  "DATABASE_URL",
];
// Secret NAMES that would prove a leak if found in the client bundle.
const SECRET_NAMES_IN_BUNDLE = ["BETTER_AUTH_SECRET", "GOOGLE_CLIENT_SECRET"];

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

// --- Check 3: grep the built client bundle --------------------------------
let bundleStatus = "skipped (.next/static absent — run after build)";
if (existsSync(STATIC_DIR)) {
  bundleStatus = "clean";
  for (const name of SECRET_NAMES_IN_BUNDLE) {
    try {
      execSync(`grep -rl ${name} ${JSON.stringify(STATIC_DIR)}`, {
        stdio: "pipe",
      });
      // grep exit 0 => match found => leak.
      failures.push(`LEAK: secret name "${name}" found in .next/static bundle`);
      bundleStatus = "LEAK!";
    } catch {
      // grep exit 1 => no match => good for this name.
    }
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
