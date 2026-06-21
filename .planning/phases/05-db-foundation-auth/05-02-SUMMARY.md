---
phase: 05-db-foundation-auth
plan: 02
subsystem: database
tags: [seed, drizzle, better-auth, idempotency, neon]

# Dependency graph
requires: ["05-01"]
provides:
  - "Idempotent seed covering all 12 tables including verification"
  - "Seeded admin@precisionauto.com / senha123 for FOUND-02 manual auth UAT"
affects:
  [
    06-better-auth-db,
    07-service-orders-db,
    08-inventory-db,
    09-appointments-db,
    10-finance-analytics-db,
  ]

# Tech tracking
tech-stack:
  added: []
  patterns:
    [
      "FK-reverse wipe order: transactions → serviceOrderItems → serviceOrders → appointments → purchaseOrderItems → purchaseOrders → vehicles → services → session → account → verification → user",
      "Users seeded via auth.api.signUpEmail (not direct db.insert) so passwords are hashed and authenticatable",
    ]

key-files:
  created: []
  modified:
    - scripts/seed.ts

key-decisions:
  - "verification table must be deleted before user in wipe() — verification rows reference user.id via identifier (no explicit FK in schema but Better Auth relies on it)"
  - "DB-side ALTER TABLE fix applied directly (not via new migration) — missing columns from 0002 were schema drift caused by 05-01 journal registration without executing the ALTER TABLE SQL"
  - "Seed is dev-only (senha123 default) — must never run against production with real user data (T-05-04 accepted)"

patterns-established:
  - "FK-reverse delete order covers all 12 tables for clean wipe"
  - "db:seed twice in a row is the idempotency acceptance test"

requirements-completed: [FOUND-02, FOUND-03]

# Metrics
duration: 15min
completed: 2026-06-21
---

# Phase 05 Plan 02: Seed Idempotency Summary

**verification table added to seed wipe(), all 12 tables covered, two consecutive db:seed runs exit 0 with no FK or duplicate-email errors; seeded admin@precisionauto.com available for FOUND-02 auth UAT**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-06-21T13:45:00Z
- **Completed:** 2026-06-21T14:00:00Z
- **Tasks:** 2
- **Files modified:** 1 (scripts/seed.ts) + DB-side schema fix

## Accomplishments

- Added `verification as verificationTable` import and `db.delete(verificationTable)` before `db.delete(userTable)` in wipe() — FK-reverse order now complete
- All 12 relationships covered: transactions, serviceOrderItems, serviceOrders, appointments, purchaseOrderItems, purchaseOrders, vehicles, services, session, account, verification, user
- createUser unchanged — still uses `auth.api.signUpEmail` (T-05-05 mitigated)
- Seed runs cleanly twice consecutively — idempotency proven (FOUND-03)
- Admin credential admin@precisionauto.com / senha123 seeded and ready for FOUND-02 manual login UAT

## Task Commits

1. **Task 1: Fix seed idempotency — add verification to wipe** - `e0ef2eb` (fix)
2. **Task 2: Validate seed idempotency** - `ab41bb4` (chore)

## Files Created/Modified

- `scripts/seed.ts` - Added `verification as verificationTable` to import block; added `await db.delete(verificationTable)` before `await db.delete(userTable)` in wipe()

## Decisions Made

- verification must be deleted before user in wipe() — FK-reverse order requirement
- DB-side ALTER TABLE applied directly (not via new migration) — addressing 0002 schema drift from 05-01
- Seed is dev-only (senha123) — documented that it MUST NOT run against production with real users (T-05-04 accepted, T-05-05 mitigated via Better Auth API, T-05-06: DATABASE_URL not logged)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing schema columns caused seed to fail with column "category" does not exist**

- **Found during:** Task 2 (first seed run)
- **Issue:** `services` table in Neon was missing `category`, `supplier`, `location` columns, and `service_orders` was missing `checklist`, `signature_url`. These `ALTER TABLE` statements exist in migration `0002_flat_reavers.sql` but were never executed — 05-01 registered 0002 in the drizzle journal (to fix a hang) but only computed the hash without running the actual SQL. `drizzle-kit push` had previously created the tables but skipped the `ALTER TABLE` additions.
- **Fix:** Applied the 5 missing `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements directly against the Neon DB (no new migration file needed — these are part of the already-registered 0002).
- **Files modified:** None (DB-side fix only)
- **Verification:** Both `npm run db:seed` runs exit 0 after fix
- **Committed in:** `ab41bb4` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Blocking issue resolved; no scope creep. Pre-existing schema drift from 05-01 journal fix was the only blocker.

## Security Notes (Threat Model)

- **T-05-04 (Spoofing — seed password):** Accepted. seed is dev-only; `senha123` passwords are hashed by Better Auth (not plaintext). **Seed MUST NOT run against production with real user data.**
- **T-05-05 (EoP — user creation):** Mitigated. `createUser` uses `auth.api.signUpEmail` — passwords hashed via Better Auth config; no direct `db.insert(userTable)`.
- **T-05-06 (Info Disclosure — DATABASE_URL):** Mitigated. Seed does not log the connection string; .env stays local-only.

## Known Stubs

None — seed script only. No UI stubs introduced.

## Threat Flags

No new network endpoints, auth paths, file access patterns, or schema changes at new trust boundaries introduced.

## Next Phase Readiness

- DB is seeded with 12 tables of representative data — all downstream phases (06-10) can test against real data
- Admin credential available for FOUND-02 manual auth UAT: admin@precisionauto.com / senha123
- Schema drift fully resolved — all migration 0002 columns now present in Neon DB

---

_Phase: 05-db-foundation-auth_
_Completed: 2026-06-21_

## Self-Check: PASSED

- `scripts/seed.ts` modified with verification import and delete: confirmed
- Commit `e0ef2eb` exists: confirmed (Task 1)
- Commit `ab41bb4` exists: confirmed (Task 2)
- Both `npm run db:seed` runs exit 0: confirmed
