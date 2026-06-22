---
phase: 9
slug: appointments
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-22
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value               |
| ---------------------- | ------------------- |
| **Framework**          | vitest              |
| **Config file**        | `vitest.config.ts`  |
| **Quick run command**  | `npm test -- --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime**  | ~10 seconds         |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Threat Ref | Secure Behavior                               | Test Type | Automated Command    | File Exists | Status     |
| -------- | ---- | ---- | ----------- | ---------- | --------------------------------------------- | --------- | -------------------- | ----------- | ---------- |
| 09-01-01 | 01   | 1    | APPT-01     | —          | Migration idempotent, no data loss            | manual    | `npm run db:migrate` | ✅          | ⬜ pending |
| 09-01-02 | 01   | 1    | APPT-02     | —          | Closure bug fixed, status persists            | unit      | `npm test -- --run`  | ✅          | ⬜ pending |
| 09-01-03 | 01   | 1    | APPT-01     | —          | duration valueAsNumber fix                    | unit      | `npm test -- --run`  | ✅          | ⬜ pending |
| 09-02-01 | 02   | 2    | APPT-01     | —          | updateAppointmentAction accepts all fields    | unit      | `npm test -- --run`  | ✅          | ⬜ pending |
| 09-02-02 | 02   | 2    | APPT-01     | —          | EditAppointmentDrawer pre-populates correctly | manual    | browser test         | ❌ W0       | ⬜ pending |
| 09-03-01 | 03   | 2    | APPT-02     | —          | AppointmentCard shows serviceType/duration    | manual    | browser test         | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] Update `src/__tests__/_audit.test.ts` line 57 from `toBe(18)` to `toBe(19)` before adding updateAppointmentAction

_Existing test infrastructure covers all other phase requirements._

---

## Manual-Only Verifications

| Behavior                                        | Requirement | Why Manual                     | Test Instructions                                                       |
| ----------------------------------------------- | ----------- | ------------------------------ | ----------------------------------------------------------------------- |
| Appointment persists after page reload          | APPT-01     | DB round-trip requires browser | Create appointment → reload page → verify appears on calendar           |
| Cancel persists in DB                           | APPT-02     | Status change requires browser | Cancel appointment → reload page → verify cancelled status              |
| EditAppointmentDrawer pre-populates fields      | APPT-01     | UI interaction                 | Open edit drawer → verify all fields pre-populated with existing values |
| serviceType/duration display in AppointmentCard | APPT-01     | Visual rendering               | After migration + seed → verify card shows "Preventiva" and "60 min"    |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
