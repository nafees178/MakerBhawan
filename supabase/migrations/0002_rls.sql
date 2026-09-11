-- ============================================================================
-- ARTL — row level security
-- ============================================================================
-- The governing rule: anything only the dev team should change is enforced
-- here, in Postgres, not in a route guard. The anon key is public by design and
-- anyone can call PostgREST directly, so a page that merely hides the admin UI
-- protects nothing.
--
-- Note that RLS *filters* rather than *rejects*: a student updating someone
-- else's row gets "0 rows updated", not an error. That is the intended
-- behaviour, and it is why the tests in tests/rls.spec.ts assert on row counts.
-- ============================================================================

alter table profiles enable row level security;
alter table items    enable row level security;
alter table loans    enable row level security;
alter table projects enable row level security;
alter table events   enable row level security;
alter table members  enable row level security;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
-- Any signed-in user can read profiles: the admin queue has to show who
-- requested what, and the roster needs names.
create policy profiles_read on profiles
  for select to authenticated
  using (true);

-- You may edit your own row. `role` is excluded from this by the column grant
-- below AND by the profiles_role_guard trigger — belt and braces, because this
-- is the single highest-value privilege escalation in the system.
create policy profiles_update_own on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

revoke update on profiles from authenticated;
grant update (full_name, roll_no) on profiles to authenticated;

create policy profiles_admin_all on profiles
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ----------------------------------------------------------------------------
-- items — world readable, coordinator writable
-- ----------------------------------------------------------------------------
-- `anon` is included deliberately: the marketing site shows live stock to
-- visitors who have not signed in.
create policy items_read on items
  for select to anon, authenticated
  using (true);

create policy items_write on items
  for all to authenticated
  using (is_coordinator())
  with check (is_coordinator());

-- Stock columns are never writable directly, even by coordinators. Every
-- movement goes through the RPCs in 0003, which take the row lock that makes
-- concurrent approval safe. Allowing a direct UPDATE would quietly reintroduce
-- the double-spend this whole design exists to prevent.
revoke update on items from authenticated;
grant update (
  code, name, category, description, specs, qty_total, image_url
) on items to authenticated;

-- ----------------------------------------------------------------------------
-- loans
-- ----------------------------------------------------------------------------
create policy loans_read_own on loans
  for select to authenticated
  using (user_id = auth.uid() or is_coordinator());

-- No INSERT policy at all: loans are created exclusively through
-- request_loan(), which enforces the guest restriction and the duplicate check.
-- Omitting the policy is what blocks direct inserts.

-- A student may withdraw their own request while it is still pending. They may
-- not approve it, and they may not touch it once it has become a real loan.
create policy loans_cancel_own on loans
  for update to authenticated
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid() and status = 'cancelled');

create policy loans_coordinator_update on loans
  for update to authenticated
  using (is_coordinator())
  with check (is_coordinator());

-- ----------------------------------------------------------------------------
-- Public content — this is the "keep it within the dev team" surface
-- ----------------------------------------------------------------------------
-- Published rows are visible to everyone; unpublished drafts only to
-- coordinators, so work in progress never leaks onto the live site.
create policy projects_read on projects
  for select to anon, authenticated
  using (published or is_coordinator());

create policy projects_write on projects
  for all to authenticated
  using (is_coordinator())
  with check (is_coordinator());

create policy events_read on events
  for select to anon, authenticated
  using (published or is_coordinator());

create policy events_write on events
  for all to authenticated
  using (is_coordinator())
  with check (is_coordinator());

create policy members_read on members
  for select to anon, authenticated
  using (true);

create policy members_write on members
  for all to authenticated
  using (is_coordinator())
  with check (is_coordinator());

-- ----------------------------------------------------------------------------
-- Storage — same rule as the content tables
-- ----------------------------------------------------------------------------
-- Without these, anyone holding the anon key can upload whatever they like into
-- the media bucket, which is a defacement vector rather than a data leak.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy media_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');

create policy media_write on storage.objects
  for all to authenticated
  using (bucket_id = 'media' and is_coordinator())
  with check (bucket_id = 'media' and is_coordinator());
