-- ============================================================================
-- ARTL — table privileges
-- ============================================================================
-- 0002 enables RLS and writes the policies, but a policy is only ever consulted
-- AFTER the table-level privilege check passes. The API roles held no
-- SELECT/INSERT/UPDATE/DELETE on anything in `public`, so every policy in 0002
-- was unreachable and the whole lending system answered
-- "permission denied for table items" — including `service_role`.
--
-- Recent Supabase releases stopped granting blanket DML to anon/authenticated
-- on newly created tables (default privileges now cover only
-- REFERENCES/TRIGGER/TRUNCATE), so migrations have to say this out loud. This
-- was invisible because src/lib/content.ts still serves every page from
-- constants; it would have surfaced the moment a page read from Postgres.
--
-- Two layers, deliberately: GRANT is the coarse gate — which verbs a role may
-- attempt — and RLS is the fine one, deciding which rows. Both must allow.
-- ============================================================================

grant usage on schema public to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- service_role — the server-side admin key, which also carries BYPASSRLS
-- ----------------------------------------------------------------------------
-- Never exposed to a browser. Without this the test suites cannot even set up
-- their own fixtures.
grant all on all tables in schema public to service_role;

-- ----------------------------------------------------------------------------
-- anon — the public marketing surface
-- ----------------------------------------------------------------------------
-- Read-only, and only the tables whose 0002 policies name `anon`. Live stock is
-- shown to visitors who have not signed in; `projects`/`events` still filter
-- unpublished drafts through their policies.
grant select on items, projects, events, members to anon;
grant select on items_with_demand to anon;

-- ----------------------------------------------------------------------------
-- authenticated
-- ----------------------------------------------------------------------------
grant select on profiles, items, loans, projects, events, members to authenticated;
grant select on items_with_demand to authenticated;

-- NOT `grant update on profiles` / `grant update on items`. Both already carry
-- deliberate COLUMN-level update grants from 0002, and a table-level grant here
-- would silently widen them back out — re-opening direct writes to
-- `profiles.role` (privilege escalation) and to `items.qty_available` (the
-- double-spend the RPCs exist to prevent). The column grants stand as written.

-- Coordinators create and remove catalogue rows; `items_write` gates the rows.
grant insert, delete on items to authenticated;

-- Admins may create and remove profiles; `profiles_admin_all` gates the rows.
grant insert, delete on profiles to authenticated;

-- Loans get UPDATE only — students cancel their own pending request, and
-- coordinators act on the queue. No INSERT and no DELETE by design: rows are
-- created solely through request_loan(), which enforces the guest restriction
-- and the duplicate check, and a loan is history once it exists.
grant update on loans to authenticated;

-- Content tables are wholly coordinator-managed; the *_write policies gate them.
grant insert, update, delete on projects, events, members to authenticated;
