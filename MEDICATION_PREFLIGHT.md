# Medication Contract Preflight

Read-only preflight performed before the Medication Reference Slice plan. No source, database, migration, native, or configuration files were changed. This report does not verify the deployed Supabase schema or RLS configuration.

## Medication Fields Approved for This Slice

Use only the migration-common Medication inventory fields:

| Field | Evidence / use |
| --- | --- |
| `id` | Primary key in both Medication table definitions. |
| `clerk_user_id` | Owner field in both definitions; also used by export and ownership policies. |
| `name` | Required in both definitions; used by current client and export. |
| `dosage` | Present in both definitions; used by current client and export. |
| `frequency` | Present in both definitions; used by export and Supplement compatibility writes. |
| `is_active` | Present in both definitions and selected by the health export. |
| `created_at` | Present in both definitions. |

These are a conservative client slice, not confirmation of the active deployment. Keep `dosage` and `frequency` opaque strings. Do not use the current wildcard select as proof that other fields are safe to persist.

## Unsupported Fields

The following are absent from at least one Medication migration and are outside this slice: `time_of_day`, `reminder_time`, `start_date`, `end_date`, `notes`, and `updated_at`. Do not use these as inventory fields until the deployed contract is verified. Medication-log fields are also excluded from inventory: `medication_id`, `taken_at`, `skipped`, `status`, and log `notes`.

The existing UI additionally implies scheduled times, dose-taking history, refills, pharmacy ordering, reminder scheduling, and morning/night stacks. The current Medication inventory schema does not establish those behaviors.

## Real vs Fabricated UI Behavior

### Supported Real Feature

[`src/hooks/useMedication.ts`](src/hooks/useMedication.ts) provides a Supabase `medications` load, upsert, and delete API. `load()` selects `*` ordered by `created_at`; `upsert()` adds the Clerk `userId` as `clerk_user_id`; `remove(id)` deletes by `id`. This is a real persistence path when requests succeed, but active deployment schema and RLS are not verified.

The tracker invokes `load()` but does not render the returned `medications`; it also does not present hook loading or error state. The History screen likewise invokes `load()` but renders a separate local array. No Medication screen currently exposes the hook's delete operation.

[`supabase/functions/export-health-report/index.ts`](supabase/functions/export-health-report/index.ts) reads `name`, `dosage`, `frequency`, and `is_active` from `medications` for the health export. [`supabase/functions/delete-account/index.ts`](supabase/functions/delete-account/index.ts) removes `medication_logs`, `medications`, and `supplements` during account deletion. [`supabase/functions/send-reminders/index.ts`](supabase/functions/send-reminders/index.ts) has generic medication reminder copy, but this is not evidence of persisted Medication schedules or a Medication-specific scheduling workflow.

### Tracker Interaction Inventory

| UI capability | Data required | Current data source | Persistence status | Can safely remain as-is? |
| --- | --- | --- | --- | --- |
| Load Medication inventory | User-owned inventory rows | Hook queries `medications`; result is held in hook state but not displayed | Real request path; deployment/RLS not verified | The inventory capability can remain, but it must be rendered with honest loading/error states before it is a usable tracker. |
| Today's schedule cards | Medication, dosage, scheduled time, date, adherence state | Local `useState` fixtures | No schedule persistence; values are demo data | Not safe to present as the user's real schedule. Preserve the schedule concept, but source it from verified data or identify it as unavailable. |
| Mark a schedule item taken/not taken | Stable medication ID, scheduled occurrence, timestamp, outcome | Local toggle plus `upsert({name, dosage, notes: 'taken'/'not_taken'})` | The upsert attempts a real inventory write, not a log write. It sends no fixture ID, so it can create a new inventory row; `notes` is not migration-common. | Not safe as a real adherence control. Preserve the intended capability only with a verified event contract and truthful save result. |
| My Cabinet and refill dates | Actual inventory/refill information and dates | Local `Amoxicillin` and `Iron Supplement` fixtures | No persistence | Not safe as real refill information. Keep the cabinet/refill product intent distinct from the fake records. |
| Order / Ordered action and toast | Pharmacy or order service, order identity/status | Local `ordered` flag and timeout toast | No external request or persistence | Not safe as a placed-order claim. The action is a prototype, not a connected order workflow. |
| Open History | Route to `MEDICATION_HISTORY` | `onNavigate` callback | Real in-app route navigation | Yes; route wiring is real. |
| Supplement Tracker banner | Route to `SUPPLEMENT_TRACKER` | `onNavigate` callback; subtitle is static copy | Real in-app route navigation; subtitle is not data-backed | Navigation can remain; do not treat the displayed stack summary as current user data. |
| Back | Parent destination | `App.tsx` callback | Real in-app route navigation | Yes; tracker returns to Home. |

### History Behavior

[`src/components/screens/ModernizedMedicationHistoryScreen.tsx`](src/components/screens/ModernizedMedicationHistoryScreen.tsx) seeds six local timeline entries. The dates, times, names, and all-`taken` statuses are fixtures; the screen does not derive the list from hook state. Clicking a row changes its local badge and calls `upsert()` with the name and a `notes` status, but no medication ID or history occurrence. This is not persisted medication history and can create inventory rows rather than history events. It is not safe to present as real history or adherence. Keep the History destination, but show an explicit unavailable state until its schema and semantics are verified. Its Back action returns to the tracker.

## Supplement Compatibility Contract

There is no `src/hooks/useSupplement.ts` in the workspace. The existing Supplement screen depends on [`src/hooks/useMedication.ts`](src/hooks/useMedication.ts), also used by the Medication screens.

The current hook API is:

- `medications`: `Medication[]`, where `Medication` has optional `id`, `dosage`, `frequency`, `start_date`, `end_date`, and `notes`, plus required `name`.
- `isLoading`: boolean.
- `error`: nullable string.
- `load()`: async load operation.
- `upsert(med)`: async upsert returning the persisted row; rejects on failure.
- `remove(id)`: async delete operation; rejects on failure.

The Supplement screen destructures only `upsert`. Its Add Supplement action passes `{ name, dosage, frequency }`, where frequency is `Daily (Morning)` or `Daily (Night)`. It does not call `load`, `remove`, or persist the morning/night toggle state. It adds the item to local stack state and shows an added toast before/irrespective of save success; failed writes are only logged. The hook writes to `medications`, not the `supplements` table. Preserve this call shape and common-field persistence during the slice; do not migrate Supplement behavior here.

## Fake-Data Inventory

| Location | Sample values / interaction | Classification |
| --- | --- | --- |
| Medication tracker schedule | `Prenatal Vitamin`, `1 tablet`, `9:00 AM`, initially not taken; `Levothyroxine`, `50 mcg`, `9:00 AM`, initially taken; `Magnesium Glycinate`, `400 mg`, `8:00 PM`, initially taken | Local demo schedule and adherence states. Toggle also makes the invalid inventory upsert described above. |
| Medication tracker cabinet | `Amoxicillin`, refill by Oct 30; `Iron Supplement`, refill by Nov 15 | Local demo names and refill dates. |
| Medication tracker order action | Local `Ordered` state and "Order placed" toast | Simulated order, no ordering service. |
| Medication History | `Prenatal Vitamin` on Oct 23 and Oct 21, `Cycle Support Supplement` on Oct 22 at 8:30 PM, `Levothyroxine` on Oct 20 at 8:00 AM; all seeded as taken | Local demo dates/times/medications/adherence. Row toggles are local plus an inventory upsert, not history persistence. |
| Home quick tracker | "3 scheduled today" | Static count, not computed from inventory. |
| Notification inbox | "Evening Magnesium & Zinc Reminder", "1h ago" | Static example notification; not a Medication schedule or delivered reminder record. |
| Supplement Tracker | `Vitamin D3 & K2` 5000 IU, `Omega-3 Fish Oil` 1000 mg, `Probiotic Complex` 25 Billion CFU; `Magnesium Glycinate` 200 mg, `Ashwagandha Root` 600 mg, `L-Theanine` 200 mg; seeded taken states | Local demo stacks/toggle states. Only newly added items attempt the legacy inventory upsert. |
| Supplement reminder menu | Toast says reminders are set for 8:00 AM and 9:30 PM | Toast-only prototype; no reminder persistence/scheduler call in this screen. |
| Directory/profile copy | Descriptions mention schedule, refills, stacks, and tracker capabilities | Static discovery copy, not evidence of connected data. |

The visible schedule, adherence, refill, ordering, and history concepts are intended UI capabilities; this inventory classifies their current backing as demo or unsupported rather than recommending that the concepts be removed.

## Database Contract and Migration Risks

### Medication Inventory

[`supabase/migrations/002_medical_tables.sql`](supabase/migrations/002_medical_tables.sql) defines `medications` with `id`, `clerk_user_id`, `name`, `dosage`, `frequency`, `time_of_day`, `start_date`, `end_date`, `is_active`, `notes`, `created_at`, and `updated_at`.

[`supabase/migrations/008_backend_schema.sql`](supabase/migrations/008_backend_schema.sql) defines `public.medications` with `id`, `clerk_user_id`, `name`, `dosage`, `frequency`, `reminder_time`, `is_active`, and `created_at`.

The common fields are the approved slice listed above. `time_of_day`, `start_date`, `end_date`, `notes`, and `updated_at` occur in 002 but not 008; `reminder_time` occurs in 008 but not 002. The active client uses `select('*')` and accepts some non-common fields in its TypeScript input, so schema mismatch can surface as query/write errors. Migration definitions alone do not establish migration order or deployed columns.

### Medication Logs

Migration 002 defines `medication_logs` with required `medication_id`, `taken_at`, `skipped`, `notes`, and `created_at`. Migration 008 instead makes `medication_id` nullable, adds required `status` constrained to `taken`, `skipped`, or `missed`, and omits `skipped` and `notes` columns. The shared names do not resolve the changed nullability or event-status semantics.

There are no Medication client reads/writes to `medication_logs`; the only non-migration operational reference found is account deletion. Neither the UI's `taken`/`not_taken` note strings nor the reminder function establish the log status contract. Do not query or write logs, and keep History persistence unavailable pending schema and semantics verification.

### Supplement Table and Ownership

The `supplements` table also differs: migration 002 includes `frequency`, `time_of_day`, `is_active`, `notes`, and `updated_at`; migration 008 instead has `taken_daily` and omits those fields. The current Supplement Add action does not write this table.

Both Medication migrations show owner RLS policies based on the Clerk JWT subject, with different policy names/shapes. The active deployment, actual policy state, and Clerk-to-Supabase JWT configuration are not verified. The current hook scopes `upsert` ownership from Clerk, but `load()` and `remove()` have no explicit `clerk_user_id` filter and rely on RLS. Treat schema and RLS as **NOT VERIFIED**.

## Navigation References

- [`src/types.ts`](src/types.ts) declares both `MEDICATION_TRACKER` and `MEDICATION_HISTORY` as `AppView` values.
- [`src/App.tsx`](src/App.tsx) mounts the tracker with Back to `HOME`; it mounts History with Back to `MEDICATION_TRACKER`.
- The tracker History button navigates to `MEDICATION_HISTORY`; History has no in-screen route to another destination besides Back.
- Tracker entry points include the home quick tracker in [`src/components/screens/HarmonizedForecastHomeScreen.tsx`](src/components/screens/HarmonizedForecastHomeScreen.tsx), the Profile card in [`src/components/screens/ModernizedProfileScreen.tsx`](src/components/screens/ModernizedProfileScreen.tsx), the directory entries in [`src/components/common/ScreenDirectoryModal.tsx`](src/components/common/ScreenDirectoryModal.tsx), and the static medication notification action in [`src/components/screens/ModernizedNotificationInboxScreen.tsx`](src/components/screens/ModernizedNotificationInboxScreen.tsx).
- The directory lists both tracker and History as destinations. The main [`src/components/common/BottomNavBar.tsx`](src/components/common/BottomNavBar.tsx) maps the tracker to the Calendar active tab; it does not provide a dedicated Medication route entry.

## Preflight Conclusion

The defensible slice is Medication inventory using only the seven common fields, with identity owned by Clerk at the feature boundary. The existing inventory hook is real but its results are not currently displayed by either Medication screen. Schedule/adherence and History need honest treatment because current UI records are fixtures and the log schema is inconsistent. Keep the Supplement hook API and its current caller contract unchanged during this preflight and the later Medication slice.

Schema and RLS: **NOT VERIFIED**. Medication History persistence: **DEFERRED / UNAVAILABLE**. No Medication calculations are established by this inspection.