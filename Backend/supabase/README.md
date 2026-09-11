# VASP Trace -- Supabase schema

`migrations/001_initial_schema.sql` is the complete database schema for
investigation persistence: tables, indexes, triggers, and Row Level
Security policies. It is additive infrastructure only -- it does not
change the FastAPI backend, the frontend, or any blockchain/NetworkX
tracing code.

## 1. What this schema creates

- 7 tables: `profiles`, `investigations`, `investigation_results`,
  `evidence`, `investigation_notes`, `copilot_conversations`,
  `copilot_messages`
- A `set_updated_at()` trigger function, applied to every table that has an
  `updated_at` column (`profiles`, `investigations`, `investigation_notes`)
- A `handle_new_user()` trigger function + `on_auth_user_created` trigger
  that auto-creates a `profiles` row whenever a new `auth.users` row is
  inserted (i.e. on every signup)
- A `generate_case_number()` function that produces human-readable case
  numbers like `VT-2026-0001`, used as the default for
  `investigations.case_number`
- Indexes on every foreign key used for lookups (`user_id`,
  `investigation_id`, `conversation_id`), plus `wallet_address` on
  `investigations`
- Row Level Security, enabled and enforced on all 7 tables

No API keys, passwords, or secrets appear anywhere in this file, and none
are required to run it -- authentication is entirely handled by Supabase
Auth (`auth.users`); this schema only references it as a foreign key
target.

## 2. How to run it

1. Open your Supabase project's dashboard.
2. Go to **SQL Editor** -> **New query**.
3. Paste the full contents of `migrations/001_initial_schema.sql`.
4. Click **Run**.

The file is idempotent-ish for reruns: every `create table`/`create index`
uses `if not exists`, and every `create policy`/`create trigger` is
preceded by a matching `drop ... if exists`, so re-running it on a project
that already has this schema applied will not error. It is **not** safe to
run against a database that has since had manual schema changes you want
to keep -- it will not drop or alter existing tables, but a trigger/policy
with the same name will be silently replaced.

Alternative (Supabase CLI, if you use migrations-as-code):
```bash
supabase link --project-ref <your-project-ref>
supabase db push
```
(Requires the file to be under a `supabase/migrations/` directory the CLI
recognizes -- copy or symlink it there if you adopt the CLI workflow later.)

## 3. Tables created

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | One row per user, auto-created on signup | `id` (= `auth.users.id`), `full_name`, `role` |
| `investigations` | The core case record | `id`, `user_id`, `case_number` (auto `VT-YYYY-NNNN`), `title`, `wallet_address`, `status`, `max_hops`, `max_nodes`, `risk_score`, `classification` |
| `investigation_results` | One row per trace run | `investigation_id`, `result` (JSONB -- the full `/trace` response) |
| `evidence` | Supporting artifacts attached to a case | `investigation_id`, `evidence_type`, `title`, `description`, `data` (JSONB) |
| `investigation_notes` | Free-text investigator notes | `investigation_id`, `user_id`, `content` |
| `copilot_conversations` | **Schema only** -- future Gemini copilot | `investigation_id`, `user_id` |
| `copilot_messages` | **Schema only** -- future Gemini copilot | `conversation_id`, `role`, `content`, `metadata` (JSONB) |

`investigation_results`, `evidence`, and `copilot_messages` have no direct
`user_id` column -- ownership is derived by joining back to
`investigations.user_id` (or, for `copilot_messages`, through
`copilot_conversations` -> `investigations`). This matches how the
existing backend actually writes these tables (see
`Backend/app/investigations_db.py`), which never sets a `user_id` on those
inserts either.

## 4. RLS policies

Every table has RLS **enabled**, and every policy is scoped to
`auth.uid()` -- the ID of whoever the Supabase-verified JWT belongs to,
never a value the client can spoof by passing a different ID in a request
body.

- **`profiles`**: `select`/`update` where `id = auth.uid()`. No client
  `insert`/`delete` policy -- rows are created only by the
  `security definer` trigger.
- **`investigations`**: `select`/`insert`/`update`/`delete`, all requiring
  `user_id = auth.uid()`.
- **`investigation_results`**: `select`/`insert` require
  `exists (select 1 from investigations where id = investigation_id and
  user_id = auth.uid())` -- i.e. you can only touch results for a case you
  own. No `update`/`delete` policy: results are an append-only trace
  history.
- **`evidence`**: `select`/`insert`/`delete`, same "owns the parent
  investigation" check as above.
- **`investigation_notes`**: `select`/`insert` require **both**
  `user_id = auth.uid()` **and** ownership of the parent investigation --
  this stops a user from attaching a note to someone else's investigation
  even if they only control the `user_id` field, not just the
  `investigation_id`. `update`/`delete` require `user_id = auth.uid()`.
- **`copilot_conversations`** / **`copilot_messages`**: same
  ownership-via-parent-investigation pattern, ready for when the Gemini
  feature starts using them. Not exercised by any current endpoint.

**The core guarantee**: changing an `id`/`investigation_id` in a request to
one you don't own returns zero rows from every one of these policies --
there is no path, at the database level, for a user to read, modify, or
delete another user's investigation or anything attached to it.

## 5. Required Supabase Auth configuration

- **Email/password auth enabled** (Authentication -> Providers -> Email).
  This schema doesn't require any specific provider, but the existing
  backend's auth flow (`Backend/app/auth.py`) was built against
  email/password Supabase Auth.
- **No custom claims or RLS-affecting auth settings are required.**
  `auth.uid()` is populated automatically by Supabase for any
  authenticated request; nothing in this schema depends on JWT custom
  claims, so it works out of the box.
- **`raw_user_meta_data.full_name` is optional.** `handle_new_user()`
  reads it via `new.raw_user_meta_data ->> 'full_name'` if the frontend
  passes `data: { full_name: "..." }` at signup; if it's absent,
  `profiles.full_name` is simply `NULL` and can be filled in later via the
  `profiles_update_own` policy.

## 6. Assumptions made

Called out explicitly since none of these were fully specified by the
request or fully pinned down by the existing backend code:

1. **Case numbers don't reset per year.** `generate_case_number()` uses one
   global sequence, formatted as `VT-<current year>-<zero-padded
   sequence>`. This means numbers keep incrementing across a year boundary
   (e.g. `VT-2026-0999` could be followed by `VT-2027-1000`), not reset to
   `VT-2027-0001`. A true per-year-reset counter needs either a
   partitioned-by-year sequence or a locking counter table, which is
   meaningfully more complex and felt like over-engineering for what the
   request described -- flagging it here so it's a conscious tradeoff, not
   a silent one.
2. **`case_number` is `UNIQUE`.** Not explicitly requested, but a
   human-readable case identifier that could collide seemed like a latent
   bug, so I added the constraint.
3. **`max_hops`/`max_nodes` defaults and `CHECK` ranges (1-8, 1-150)**
   mirror the existing Pydantic validation in
   `Backend/app/investigations.py`'s `InvestigationCreate` model exactly,
   as DB-level defense-in-depth. If that validation ever changes in the
   backend, this migration won't automatically follow -- they're
   independently maintained.
4. **`risk_score` is `numeric(5,2)`** with a `0-100` `CHECK` constraint,
   matching `Backend/app/risk.py::classify_trace_result`, which always
   returns `round(confidence * 100, 2)`.
5. **`classification` and `status` are plain `text`, no `CHECK`/enum
   constraint.** The backend currently only ever writes a fixed small set
   of values (`OPEN`/`TRACED` for status;
   `NO_CANDIDATES`/`DIRECT_EXCHANGE_HIT`/`HEURISTIC_CANDIDATE`/`MIXER_OBSCURED`
   for classification -- see `Backend/app/risk.py`), but I left the column
   unconstrained rather than hard-coding those specific strings into the
   schema, since enforcing that list at the DB layer would need a
   migration every time the backend's classification logic changes.
6. **Reconciled with an earlier draft.** An earlier, separate migration
   (`supabase/migrations/0001_initial_schema.sql`, repo root) covered
   materially the same schema from earlier work in this project. It has
   since been removed -- `Backend/supabase/migrations/001_initial_schema.sql`
   is now the single canonical migration; it was a strict superset (this
   file additionally has `case_number` auto-generation, extra check
   constraints on `max_hops`/`max_nodes`/`risk_score`, an
   `investigations.wallet_address` index, an `evidence_owner_delete`
   policy, and idempotent `drop ... if exists` guards ahead of every
   trigger/policy), so nothing was lost in the removal.
7. **`pgcrypto` extension**: added `create extension if not exists
   pgcrypto` defensively for `gen_random_uuid()`. Supabase projects
   typically already have this available (native in Postgres 13+), so this
   line is expected to be a no-op on a standard Supabase project, not a
   strict requirement.
