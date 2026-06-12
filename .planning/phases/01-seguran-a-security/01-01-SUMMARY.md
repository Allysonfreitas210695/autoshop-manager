---
phase: 01-seguran-a-security
plan: 01
status: complete
completed_at: "2026-06-12"
requirements: [SEC-01]
files_modified:
  - src/_schemas/auth.ts
  - src/_schemas/auth.test.ts
  - src/_lib/auth.ts
---

# 01-01 Summary — Password policy (SEC-01 / D-08)

## Outcome

Register and reset now enforce a shared password policy (min 8 + at least one
letter and one number) on client AND server via a single Zod `passwordSchema`,
mirrored by Better Auth `minPasswordLength: 8`. Login keeps `min(8)` only so the
complexity policy is not leaked at the login surface. The FLAGGED reset-link
logging gap is closed: the sensitive URL is logged only outside production.

## What was built

- **`src/_schemas/auth.ts`** — new exported `passwordSchema`
  (`.min(8).regex(/[A-Za-z]/).regex(/[0-9]/)` with PT-BR messages). `registerSchema`
  and `resetPasswordSchema` now reference `password: passwordSchema`; `loginSchema`
  unchanged (`z.string().min(8)`). All `.refine` confirm-match rules and
  `z.infer` exports preserved.
- **`src/_schemas/auth.test.ts`** — 7 unit tests: length/letter/number reject +
  accept on `passwordSchema`, register + reset reject (no number), and login
  accepts an 8-char letters-only password (policy not leaked).
- **`src/_lib/auth.ts`** — `emailAndPassword.minPasswordLength: 8`; the
  `sendResetPassword` `console.log` of the reset URL is now guarded behind
  `process.env.NODE_ENV !== "production"`. Email-provider wiring left as a
  documented TODO (deferred).

## Verification

- `npx vitest run src/_schemas/auth.test.ts` — 7 passed
- `npx tsc --noEmit` — 0 errors
- `npm run lint` — 0 errors

## Follow-ups

- **Reset-password email provider** (Resend/Nodemailer): `sendResetPassword`
  still only logs the link in non-production. Production email transport is a
  tracked integration follow-up, not delivered this phase.
