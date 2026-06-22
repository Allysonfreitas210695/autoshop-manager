---
phase: 09-appointments
reviewed: 2026-06-22T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/app/(dashboard)/appointments/_components/AppointmentCard.tsx
  - src/app/(dashboard)/appointments/appointments-client.tsx
  - src/app/(dashboard)/appointments/_components/EditAppointmentDrawer.tsx
  - src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx
  - src/_actions/appointments.ts
  - src/_data-access/appointments.ts
  - src/_hooks/use-appointment-form.ts
  - scripts/seed.ts
findings:
  critical: 3
  warning: 4
  info: 3
  total: 10
status: issues_found
---

# Phase 09: Code Review Report

**Reviewed:** 2026-06-22T00:00:00Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

The appointments feature is largely functional but has three blockers: a missing ownership check on the `updateAppointmentAction` that allows any authenticated user to mutate any appointment; a stale-UI bug after editing an appointment because the parent state is never updated; and a datetime construction that ignores the user's timezone. Four warnings cover schema inconsistencies, an unvalidated date range, and missing form reset on edit. Three info items cover duplication and minor naming issues.

---

## Critical Issues

### CR-01: Any authenticated user can update or cancel any appointment (IDOR)

**File:** `src/_actions/appointments.ts:57-69` (also line `79-86`)

**Issue:** `updateAppointmentAction` and `updateAppointmentStatusAction` look up the appointment only by `id` provided by the client, with no check that the record belongs to the current session's organisation or user. Any authenticated mechanic or customer can update or cancel an appointment belonging to someone else by supplying a valid UUID they discover or guess.

**Fix:**

```typescript
// In updateAppointmentAction / updateAppointmentStatusAction, add ownership guard:
.action(async ({ parsedInput, ctx }) => {
  // Verify the appointment exists and belongs to this user's scope
  const existing = await db.query.appointments.findFirst({
    where: eq(appointments.id, parsedInput.id),
  });
  if (!existing) throw new ActionError("Agendamento não encontrado.");
  // If role-based: only admin/mechanic may update; or check customerId === ctx.user.id
  if (ctx.user.role === "customer" && existing.customerId !== ctx.user.id) {
    throw new ActionError("Não autorizado.");
  }
  // ... rest of update
});
```

---

### CR-02: Edited appointment never reflected in UI — stale data shown until reload

**File:** `src/_hooks/use-appointment-form.ts:86-93` / `src/app/(dashboard)/appointments/appointments-client.tsx:539-550`

**Issue:** The `onSuccess` callback for `updateAppointmentAction` only calls `onClose()` and shows a toast. The parent `AppointmentsClient` has no mechanism to receive the updated record, so after a successful edit the card continues to display the old customer, vehicle, date, and mechanic data. The user sees success feedback but incorrect data until they reload.

`revalidatePath` is called on the server, which updates Next.js cache, but the component is using local `useState` (`appointments` state) that is never refreshed. The server-side cache is updated but the client never re-reads it because the component does not re-mount.

**Fix:** Pass an `onSuccess` callback prop from `AppointmentsClient` into `EditAppointmentDrawer` and then into `useAppointmentForm`, updating local state with the returned data:

```typescript
// useAppointmentForm — accept onUpdated callback
type Params = {
  ...
  onUpdated?: (updated: AppointmentRow) => void;
};

// In onSuccess:
onSuccess: ({ data }) => {
  toast.success("Agendamento atualizado com sucesso.");
  if (data) onUpdated?.(data); // pass updated row up
  onClose();
},

// updateAppointmentAction — return full updated row, not just id
return { id, ...rest, scheduledAt: new Date(rest.scheduledAt) };

// AppointmentsClient
<EditAppointmentDrawer
  ...
  onUpdated={(updated) =>
    setAppointments((prev) =>
      prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
    )
  }
/>
```

---

### CR-03: Datetime construction ignores user timezone — appointments saved at wrong time

**File:** `src/_hooks/use-appointment-form.ts:103`

**Issue:**

```typescript
scheduledAt: new Date(`${data.date}T${data.time}:00`).toISOString(),
```

`new Date("2026-06-22T09:00:00")` is parsed as **local time** in browsers, then `.toISOString()` converts it to UTC. If the user's browser is in UTC-3 (São Paulo), a 09:00 appointment is stored as 12:00 UTC. The Zod schema on the action side validates `z.string().datetime()` which accepts ISO strings, so the wrong UTC time passes validation silently.

The server-side query in `listAppointments` filters by `scheduledAt` in UTC, and the client-side `isSameDay` comparison works with the raw `Date` object returned from the DB. Since the DB value is off by the UTC offset, the appointment may appear under the wrong calendar day for users in non-UTC zones.

**Fix:** Append the explicit UTC offset or use a fixed-timezone library:

```typescript
// Option A: treat the input as local and convert explicitly
import { parseISO, formatISO } from "date-fns";
// Option B: append timezone offset
const offset = -new Date().getTimezoneOffset();
const sign = offset >= 0 ? "+" : "-";
const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, "0");
const tz = `${sign}${pad(offset / 60)}:${pad(offset % 60)}`;
scheduledAt: new Date(`${data.date}T${data.time}:00${tz}`).toISOString(),
```

---

## Warnings

### WR-01: `customerId` schema mismatch — server accepts any string, client requires UUID

**File:** `src/_actions/appointments.ts:14` and `src/_actions/appointments.ts:45`

**Issue:** Both `createAppointmentAction` and `updateAppointmentAction` declare `customerId: z.string().optional()`, while `vehicleId` and `id` use `z.uuid()`. If a user submits a crafted non-UUID string as `customerId`, it will be inserted into the `customerId` column without format validation. Inconsistent validation between the two ID fields indicates a schema oversight that could produce silent data quality issues.

**Fix:**

```typescript
customerId: z.uuid().optional(),
// same pattern as vehicleId
```

---

### WR-02: `updateAppointmentAction` returns only `{ id }` — missing data for optimistic update

**File:** `src/_actions/appointments.ts:69`

**Issue:** The action returns `{ id }` only. The `onSuccess` handler in the hook receives only an id with no updated field values, making it impossible to properly update local UI state (see CR-02). Even if CR-02 is fixed, the caller would need to reconstruct the updated row from local form data rather than the canonical server response.

**Fix:**

```typescript
// Return the full updated appointment or at minimum all changed fields
return { id, scheduledAt: new Date(rest.scheduledAt), ...rest };
```

---

### WR-03: List view `listEnd` date input sets time to `T23:59:59`, but `listStart` appends `T00:00:00` — inconsistent

**File:** `src/app/(dashboard)/appointments/appointments-client.tsx:438` and `450`

**Issue:** The "Até" input sets `new Date(e.target.value + "T23:59:59")` but these dates are only used for client-side `isSameDay` filtering inside `eachDayOfInterval`. Neither `listStart` nor `listEnd` is passed to the server query (`listAppointments()` is called once on page load with no arguments). The range filtering is purely cosmetic on the client. If the intent is to ever pass this range to the server, the inconsistent time construction will result in off-by-one boundary bugs.

Additionally, `listEnd` being constructed with `T23:59:59` misses appointments at `T23:59:60` — use end-of-day logic (`endOfDay` from date-fns) for robustness.

**Fix:** Use `date-fns/endOfDay` and `date-fns/startOfDay`:

```typescript
onChange={(e) => e.target.value && setListEnd(endOfDay(new Date(e.target.value)))}
```

---

### WR-04: Edit form not reset when `appt` prop changes (stale initial values)

**File:** `src/app/(dashboard)/appointments/_components/EditAppointmentDrawer.tsx:41-50`

**Issue:** `initialValues` is computed as a plain object inside the component body on every render, but `useForm` only reads `defaultValues` once at mount. If `editingAppt` changes (user edits appointment A, closes, then immediately opens appointment B), the `EditAppointmentDrawer` may reuse a cached form instance from the previous mount (depending on React's reconciliation of the conditionally-rendered subtree) and show the previous appointment's values.

The parent renders `{editingAppt && <EditAppointmentDrawer ... appt={editingAppt} />}` so the component does unmount and remount when switching appointments, but adding an explicit `key={appt.id}` on the drawer is the safe pattern to guarantee fresh form state.

**Fix:**

```tsx
{editingAppt && (
  <EditAppointmentDrawer
    key={editingAppt.id}  // ← forces remount on appointment change
    ...
  />
)}
```

---

## Info

### IN-01: `statusLabels` defined in both `AppointmentCard.tsx` and `appointments-client.tsx`

**File:** `src/app/(dashboard)/appointments/_components/AppointmentCard.tsx:18-23` and `src/app/(dashboard)/appointments/appointments-client.tsx:47-52`

**Issue:** Identical `statusLabels` record duplicated in two files. A change to one label must be applied in both places.

**Fix:** Extract to a shared constants file, e.g. `src/app/(dashboard)/appointments/_lib/appointment-constants.ts` and import from both.

---

### IN-02: `mechanics` parameter accepted but unused in `useAppointmentForm`

**File:** `src/_hooks/use-appointment-form.ts:43-46`

**Issue:** `mechanics` is part of the `Params` type and destructured at the call site of both drawers, but is not used anywhere inside the hook — it is never referenced after destructuring. The drawers pass it in, then the hook silently discards it.

**Fix:** Remove `mechanics` from the `Params` type and callers, or document why it is present.

---

### IN-03: `DEFAULT_PASSWORD` hardcoded in seed script — acceptable for seed, but noted

**File:** `scripts/seed.ts:33`

**Issue:** `const DEFAULT_PASSWORD = "senha123"` is a weak, hardcoded password. Acceptable in a seed/demo script, but the script should include a comment or check that it is never run against a production database. The script currently wipes all data with no confirmation prompt.

**Fix:** Add a guard at the top of `main()`:

```typescript
if (process.env.NODE_ENV === "production") {
  console.error("ERRO: seed não deve ser executado em produção.");
  process.exit(1);
}
```

---

_Reviewed: 2026-06-22T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
