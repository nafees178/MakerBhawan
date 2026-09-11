begin;

-- ==== 0001_schema.sql ====
-- ============================================================================
-- ARTL — core schema
-- ============================================================================
-- Two things worth knowing before reading further:
--
-- 1. `profiles` is accounts; `members` is the public team roster. They are
--    separate because most people on the roster page (advisors, alumni) may
--    never sign in, and folding them together forces a nullable auth id and a
--    pile of "is this a real user" checks everywhere.
--
-- 2. Stock moves on coordinator approval, not on request. Several students may
--    hold pending requests against the last unit; `approve_loan` is where the
--    race is resolved. See 0003_rpc.sql.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists citext;

-- ----------------------------------------------------------------------------
-- Roles
-- ----------------------------------------------------------------------------
create type app_role as enum ('guest', 'student', 'coordinator', 'admin');

create type loan_status as enum (
  'pending',    -- requested, awaiting a coordinator
  'on_loan',    -- approved; stock has been decremented
  'returned',   -- back on the shelf; stock restored
  'rejected',   -- coordinator declined; no stock ever moved
  'cancelled'   -- withdrawn by the requester while still pending
);

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       citext unique not null,
  full_name   text,
  roll_no     text,
  role        app_role not null default 'guest',
  created_at  timestamptz not null default now()
);

comment on column profiles.role is
  'Set by trigger on signup from the email domain. Only an admin may change it '
  'afterwards — see enforce_role_change(). Never expose this column to an '
  'owner-update policy or any student can promote themselves.';

-- ----------------------------------------------------------------------------
-- items
-- ----------------------------------------------------------------------------
create table items (
  id             uuid primary key default uuid_generate_v4(),
  code           text unique not null,              -- ARTL-MC-001
  name           text not null,
  category       text not null,
  description    text,
  specs          jsonb not null default '{}'::jsonb,
  qty_total      integer not null check (qty_total >= 0),
  qty_available  integer not null check (qty_available >= 0),
  image_url      text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  -- The backstop. Every stock movement goes through an RPC that takes a row
  -- lock, but a constraint is what makes overselling impossible rather than
  -- merely unlikely — it holds even if someone bypasses the RPC entirely.
  constraint qty_available_within_total check (qty_available <= qty_total)
);

create index items_category_idx on items (category);
create index items_name_trgm_idx on items using gin (to_tsvector('english', name));

-- ----------------------------------------------------------------------------
-- loans
-- ----------------------------------------------------------------------------
create table loans (
  id             uuid primary key default uuid_generate_v4(),
  item_id        uuid not null references items on delete restrict,
  user_id        uuid not null references profiles on delete cascade,
  qty            integer not null default 1 check (qty > 0),
  status         loan_status not null default 'pending',
  requested_at   timestamptz not null default now(),
  decided_at     timestamptz,
  decided_by     uuid references profiles,
  due_date       date,
  returned_at    timestamptz,
  note           text,
  reject_reason  text,

  -- An approved loan must carry a due date; "borrowed indefinitely" is how
  -- equipment disappears.
  constraint on_loan_needs_due_date
    check (status <> 'on_loan' or due_date is not null)
);

create index loans_user_idx on loans (user_id, status);
create index loans_item_idx on loans (item_id, status);
create index loans_pending_idx on loans (requested_at) where status = 'pending';

-- One open request per person per item. Without this, a student can queue ten
-- requests for the same item and monopolise the approval queue.
create unique index loans_one_open_per_item
  on loans (user_id, item_id)
  where status in ('pending', 'on_loan');

-- ----------------------------------------------------------------------------
-- Public content. Written by coordinators, readable by the world.
-- ----------------------------------------------------------------------------
create table projects (
  id           uuid primary key default uuid_generate_v4(),
  slug         text unique not null,
  title        text not null,
  subtitle     text,
  body         text,
  tags         text[] not null default '{}',
  year         integer,
  sort_order   integer not null default 0,
  published    boolean not null default false,
  created_at   timestamptz not null default now()
);

create table events (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  description  text,
  location     text,
  capacity     integer check (capacity is null or capacity > 0),
  published    boolean not null default false,
  created_at   timestamptz not null default now()
);

create index events_starts_idx on events (starts_at desc);

create table members (
  id           uuid primary key default uuid_generate_v4(),
  full_name    text not null,
  role_label   text not null,
  sort_order   integer not null default 0,
  photo_url    text,
  -- Honours the flag-don't-fabricate rule: seeded rows are generic role titles
  -- ("Faculty Advisor"), and the UI renders them differently so a placeholder
  -- is never mistaken for a real person.
  is_placeholder boolean not null default true,
  is_alumni    boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Signup: classify by email domain
-- ----------------------------------------------------------------------------
-- Institute addresses become students and may borrow. Everyone else becomes a
-- guest: they can browse and RSVP, but `request_loan` refuses them, because
-- hardware should only leave the lab with someone the institute can identify.
-- ----------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    case when new.email ilike '%@iitj.ac.in' then 'student'::app_role
         else 'guest'::app_role end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- Role changes are admin-only, enforced in the database
-- ----------------------------------------------------------------------------
-- A route guard is not a security boundary — anyone can call the REST API
-- directly with the anon key. This trigger is the actual boundary. Note it
-- blocks coordinators from promoting themselves to admin, not just students.
-- ----------------------------------------------------------------------------
create or replace function enforce_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if not exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    ) then
      raise exception 'only an admin may change a role'
        using errcode = 'insufficient_privilege';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_role_guard
  before update on profiles
  for each row execute function enforce_role_change();

-- ----------------------------------------------------------------------------
-- Helpers used by the policies in 0002
-- ----------------------------------------------------------------------------
create or replace function is_coordinator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('coordinator', 'admin')
  );
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger items_touch_updated_at
  before update on items
  for each row execute function touch_updated_at();


-- ==== 0002_rls.sql ====
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


-- ==== 0003_rpc.sql ====
-- ============================================================================
-- ARTL — lending RPCs
-- ============================================================================
-- Every stock movement lives here, because every stock movement needs a row
-- lock. The tables grant no direct UPDATE on qty_available (see 0002), so this
-- is the only path.
--
-- The race being defended against: two coordinators approve two different
-- pending requests for the same last unit at the same moment. Both read
-- qty_available = 1, both decrement, and the lab has promised one item to two
-- people. `select ... for update` serialises them; the loser gets
-- 'insufficient_stock' instead of a silent oversell.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- request_loan — creates a pending request. Moves no stock.
-- ----------------------------------------------------------------------------
create or replace function request_loan(p_item uuid, p_qty integer default 1, p_note text default null)
returns loans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role app_role;
  v_item items%rowtype;
  v_loan loans%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not signed in' using errcode = 'insufficient_privilege';
  end if;

  select role into v_role from profiles where id = auth.uid();

  -- Guests (non-institute addresses) may browse and RSVP but never borrow.
  -- Enforced here rather than in the UI, since the UI is not a boundary.
  if v_role = 'guest' or v_role is null then
    raise exception 'only IIT Jodhpur members may borrow equipment'
      using errcode = 'insufficient_privilege';
  end if;

  if p_qty < 1 then
    raise exception 'quantity must be at least 1' using errcode = 'check_violation';
  end if;

  select * into v_item from items where id = p_item;
  if not found then
    raise exception 'no such item' using errcode = 'no_data_found';
  end if;

  -- Reject requests that could never be satisfied, rather than parking them in
  -- the queue for a coordinator to discover.
  if p_qty > v_item.qty_total then
    raise exception 'the lab only holds % of that item', v_item.qty_total
      using errcode = 'check_violation';
  end if;

  insert into loans (item_id, user_id, qty, status, note)
  values (p_item, auth.uid(), p_qty, 'pending', p_note)
  returning * into v_loan;

  return v_loan;
exception
  when unique_violation then
    raise exception 'you already have an open request or loan for that item'
      using errcode = 'unique_violation';
end;
$$;

-- ----------------------------------------------------------------------------
-- approve_loan — the one that takes the lock
-- ----------------------------------------------------------------------------
create or replace function approve_loan(p_loan uuid, p_due date)
returns loans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loan      loans%rowtype;
  v_available integer;
begin
  if not is_coordinator() then
    raise exception 'coordinators only' using errcode = 'insufficient_privilege';
  end if;

  if p_due is null or p_due < current_date then
    raise exception 'a due date in the future is required'
      using errcode = 'check_violation';
  end if;

  -- Lock the loan first, then the item, and always in that order. Two
  -- coordinators approving two loans against the same item would otherwise be
  -- free to grab the locks in opposite orders and deadlock.
  select * into v_loan from loans where id = p_loan for update;
  if not found then
    raise exception 'no such loan' using errcode = 'no_data_found';
  end if;

  if v_loan.status <> 'pending' then
    raise exception 'loan is already %', v_loan.status
      using errcode = 'check_violation';
  end if;

  -- The line this entire design exists for.
  select qty_available into v_available from items where id = v_loan.item_id for update;

  if v_available < v_loan.qty then
    raise exception 'insufficient_stock' using errcode = 'check_violation';
  end if;

  update items
     set qty_available = qty_available - v_loan.qty
   where id = v_loan.item_id;

  update loans
     set status = 'on_loan',
         due_date = p_due,
         decided_at = now(),
         decided_by = auth.uid()
   where id = p_loan
  returning * into v_loan;

  return v_loan;
end;
$$;

-- ----------------------------------------------------------------------------
-- reject_loan — no stock movement, because none was ever held
-- ----------------------------------------------------------------------------
create or replace function reject_loan(p_loan uuid, p_reason text default null)
returns loans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loan loans%rowtype;
begin
  if not is_coordinator() then
    raise exception 'coordinators only' using errcode = 'insufficient_privilege';
  end if;

  update loans
     set status = 'rejected',
         reject_reason = p_reason,
         decided_at = now(),
         decided_by = auth.uid()
   where id = p_loan and status = 'pending'
  returning * into v_loan;

  if not found then
    raise exception 'loan is not pending' using errcode = 'check_violation';
  end if;

  return v_loan;
end;
$$;

-- ----------------------------------------------------------------------------
-- return_loan — puts the stock back
-- ----------------------------------------------------------------------------
create or replace function return_loan(p_loan uuid)
returns loans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loan loans%rowtype;
begin
  if not is_coordinator() then
    raise exception 'coordinators only' using errcode = 'insufficient_privilege';
  end if;

  select * into v_loan from loans where id = p_loan for update;
  if not found or v_loan.status <> 'on_loan' then
    raise exception 'loan is not on loan' using errcode = 'check_violation';
  end if;

  -- `least(...)` guards the qty_available <= qty_total constraint against a
  -- double return, which would otherwise abort the transaction with a
  -- constraint violation rather than a readable error.
  update items
     set qty_available = least(qty_available + v_loan.qty, qty_total)
   where id = v_loan.item_id;

  update loans
     set status = 'returned', returned_at = now()
   where id = p_loan
  returning * into v_loan;

  return v_loan;
end;
$$;

-- ----------------------------------------------------------------------------
-- Demand view — what the register shows
-- ----------------------------------------------------------------------------
-- With stock moving at approval rather than at request, "4 available" can be
-- misleading if six people are already queued. This surfaces both numbers in
-- one query rather than making the register issue a count per row.
create or replace view items_with_demand
with (security_invoker = true)
as
select
  i.*,
  coalesce(p.pending_count, 0)::integer as pending_count,
  coalesce(p.pending_qty, 0)::integer   as pending_qty
from items i
left join (
  select item_id, count(*) as pending_count, sum(qty) as pending_qty
  from loans
  where status = 'pending'
  group by item_id
) p on p.item_id = i.id;

comment on view items_with_demand is
  'security_invoker so the view respects the caller''s RLS rather than the '
  'definer''s — without it, aggregate loan data would leak past loans_read_own.';

grant execute on function request_loan(uuid, integer, text) to authenticated;
grant execute on function approve_loan(uuid, date)          to authenticated;
grant execute on function reject_loan(uuid, text)           to authenticated;
grant execute on function return_loan(uuid)                 to authenticated;


-- ==== 0004_grants.sql ====
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


-- ==== 0005_role_bootstrap.sql ====
-- ============================================================================
-- ARTL — let a trusted server-side caller set roles
-- ============================================================================
-- enforce_role_change() (0001) demands that auth.uid() belong to an existing
-- admin before any role may change. Under the service key auth.uid() is NULL,
-- and in a psql session there is no JWT at all, so the check failed for every
-- caller that was not already an authenticated admin.
--
-- Two consequences, both real:
--   * the FIRST admin could never be created — there is no admin yet, so
--     nothing can appoint one, and the design note "coordinator/admin granted
--     by hand" had no mechanism behind it;
--   * tests/concurrency.spec.ts and tests/rls.spec.ts could not build their
--     own fixtures, which is how this surfaced.
--
-- The guard itself is right and stays exactly as strict for anyone arriving
-- through the API: it blocks students, and it blocks coordinators promoting
-- themselves, which is the escalation that matters. What it needs is an
-- exemption for callers that are already trusted.
--
-- auth.role() reads the `role` claim of the verified JWT, so it cannot be
-- forged without the project's JWT secret, and it is unaffected by this
-- function being SECURITY DEFINER (current_user would report the definer).
--   'anon' / 'authenticated' -> an end user, always checked
--   'service_role'           -> the server-side admin key, never in a browser
--   NULL                     -> no JWT: direct psql, i.e. already superuser
-- ============================================================================

create or replace function enforce_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- Trusted server-side context: the service key, or a direct SQL session.
    if coalesce(auth.role(), 'service_role') = 'service_role' then
      return new;
    end if;

    if not exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    ) then
      raise exception 'only an admin may change a role'
        using errcode = 'insufficient_privilege';
    end if;
  end if;
  return new;
end;
$$;


-- ==== 0006_official_data_and_stock_privacy.sql ====
-- ============================================================================
-- ARTL — official data shape, and stock counts for coordinators only
-- ============================================================================
-- Two changes on top of 0001–0005:
--
-- 1. Columns the official site's data carries that the original schema lacked:
--    a member's department, LinkedIn and email; an event's external link and the
--    MongoDB id it was imported from (so a re-import updates instead of
--    duplicating); an item's variant and bench-only flag.
--
-- 2. Exact stock is admin information. The public sees whether an item is
--    available, never how many the lab holds. RLS cannot hide a *column*, and a
--    column grant cannot tell a coordinator from a student (both are
--    `authenticated`), so the base table becomes coordinator-only and everyone
--    else reads `items_public`, which exposes a boolean instead of the counts.
-- ============================================================================

alter table members
  add column department   text,
  add column linkedin_url text,
  add column email        text;

alter table members alter column is_placeholder set default false;

alter table events
  add column link_url    text,
  add column external_id text unique;

alter table items
  add column variant    text,
  add column bench_only boolean not null default false;

-- ----------------------------------------------------------------------------
-- Stock privacy
-- ----------------------------------------------------------------------------
drop policy items_read on items;

create policy items_read on items
  for select to authenticated
  using (is_coordinator());

revoke select on items from anon;
revoke select on items_with_demand from anon;

-- Deliberately NOT security_invoker: the view runs as its owner so it can read
-- the counts the caller cannot, and it only ever hands back the boolean.
create view items_public as
select
  id, code, name, variant, category, description, specs, image_url, bench_only,
  (qty_available > 0) as available
from items;

comment on view items_public is
  'Public inventory. Runs as owner on purpose: exposes availability, never '
  'qty_total or qty_available. Those stay behind items_read (coordinators).';

grant select on items_public to anon, authenticated;

-- request_loan used to put qty_total in its error message, which would let any
-- student read the hidden count by asking for too many.
create or replace function request_loan(p_item uuid, p_qty integer default 1, p_note text default null)
returns loans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role app_role;
  v_item items%rowtype;
  v_loan loans%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not signed in' using errcode = 'insufficient_privilege';
  end if;

  select role into v_role from profiles where id = auth.uid();

  if v_role = 'guest' or v_role is null then
    raise exception 'only IIT Jodhpur members may borrow equipment'
      using errcode = 'insufficient_privilege';
  end if;

  if p_qty < 1 then
    raise exception 'quantity must be at least 1' using errcode = 'check_violation';
  end if;

  select * into v_item from items where id = p_item;
  if not found then
    raise exception 'no such item' using errcode = 'no_data_found';
  end if;

  if p_qty > v_item.qty_total then
    raise exception 'that quantity is more than the lab can lend'
      using errcode = 'check_violation';
  end if;

  insert into loans (item_id, user_id, qty, status, note)
  values (p_item, auth.uid(), p_qty, 'pending', p_note)
  returning * into v_loan;

  return v_loan;
exception
  when unique_violation then
    raise exception 'you already have an open request or loan for that item'
      using errcode = 'unique_violation';
end;
$$;


-- ==== 0007_exact_privileges_and_stock_rpc.sql ====
-- ============================================================================
-- ARTL — exact privileges, and a safe way for coordinators to set stock
-- ============================================================================
-- The hosted project was created with "Automatically expose new tables" on,
-- which grants anon/authenticated broad privileges on every table as it is
-- created. RLS still gates rows, but a table-level UPDATE silently widens the
-- deliberate column grants from 0002 (see the warning in 0004). So start from
-- nothing and grant exactly what the design intends, whatever that setting did.
-- ============================================================================

revoke all on all tables in schema public from anon, authenticated;

-- anon: the public site. No `items` — stock counts are coordinator-only (0006).
grant select on projects, events, members, items_public to anon;

-- authenticated: RLS decides which rows.
grant select on profiles, items, loans, projects, events, members,
                items_with_demand, items_public to authenticated;

grant insert, delete on items to authenticated;
grant update (code, name, variant, category, description, specs, qty_total,
              image_url, bench_only) on items to authenticated;

grant insert, delete on profiles to authenticated;
grant update (full_name, roll_no) on profiles to authenticated;

grant update on loans to authenticated;

grant insert, update, delete on projects, events, members to authenticated;

-- ----------------------------------------------------------------------------
-- set_item_stock — the admin's stock editor
-- ----------------------------------------------------------------------------
-- qty_available has no direct UPDATE grant (it belongs to the loan RPCs), but an
-- admin correcting a stock count still needs to set it. This takes the same row
-- lock as approve_loan so a correction cannot interleave with an approval.
create or replace function set_item_stock(p_item uuid, p_total integer, p_available integer)
returns items
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item items%rowtype;
begin
  if not is_coordinator() then
    raise exception 'coordinators only' using errcode = 'insufficient_privilege';
  end if;

  if p_total is null or p_available is null or p_total < 0 or p_available < 0
     or p_available > p_total then
    raise exception 'available must be between 0 and the total'
      using errcode = 'check_violation';
  end if;

  perform 1 from items where id = p_item for update;
  if not found then
    raise exception 'no such item' using errcode = 'no_data_found';
  end if;

  update items
     set qty_total = p_total, qty_available = p_available
   where id = p_item
  returning * into v_item;

  return v_item;
end;
$$;

revoke execute on function set_item_stock(uuid, integer, integer) from public, anon;
grant execute on function set_item_stock(uuid, integer, integer) to authenticated;

-- ----------------------------------------------------------------------------
-- set_user_role — how an admin appoints coordinators
-- ----------------------------------------------------------------------------
-- profiles.role has no UPDATE grant for anyone (0002), so even an admin cannot
-- change it through the API directly. This is the one sanctioned path. It also
-- refuses self-changes, so the last admin cannot demote themselves by accident.
create or replace function set_user_role(p_user uuid, p_role app_role)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile profiles%rowtype;
begin
  if not is_admin() then
    raise exception 'admins only' using errcode = 'insufficient_privilege';
  end if;

  if p_user = auth.uid() then
    raise exception 'you cannot change your own role' using errcode = 'check_violation';
  end if;

  update profiles set role = p_role where id = p_user
  returning * into v_profile;

  if not found then
    raise exception 'no such user' using errcode = 'no_data_found';
  end if;

  return v_profile;
end;
$$;

revoke execute on function set_user_role(uuid, app_role) from public, anon;
grant execute on function set_user_role(uuid, app_role) to authenticated;


-- ==== seed.sql ====

-- Generated by scripts/build-seed.mjs. Edit the JSON in data-official/, not this file.

insert into items (code, name, variant, category, description, specs, qty_total, qty_available, bench_only) values
  ('ARTL-MC-001', 'Arduino Uno', 'R3', 'Microcontroller', 'ATmega328P development board. The lab''s default starting point for anything with a sensor on it.', '[{"label":"MCU","value":"ATmega328P"},{"label":"Logic","value":"5 V"},{"label":"Flash","value":"32 KB"}]'::jsonb, 12, 12, false),
  ('ARTL-MT-014', 'DC Motor', '300 rpm', 'Motor', 'Geared DC motor. Six of these drive MiniRover-1.', '[{"label":"Speed","value":"300 rpm"},{"label":"Supply","value":"12 V"}]'::jsonb, 6, 4, false),
  ('ARTL-SN-022', 'HC-05', 'Bluetooth', 'Module', 'Serial Bluetooth module. The rover''s wireless migration depends on these.', '[{"label":"Profile","value":"SPP"},{"label":"Baud","value":"9600 default"}]'::jsonb, 2, 2, false),
  ('ARTL-PW-007', 'LiPo', '11.1 V 2200 mAh', 'Power', '3S lithium polymer pack. Charge on the bench, never unattended.', '[{"label":"Cells","value":"3S"},{"label":"Capacity","value":"2200 mAh"}]'::jsonb, 3, 0, false),
  ('ARTL-SW-003', 'DPDT', 'Switch', 'Component', 'Double pole double throw. Used for the wired rover control.', '[]'::jsonb, 8, 8, false),
  ('ARTL-TL-031', 'Oscilloscope', '100 MHz', 'Instrument', 'Bench oscilloscope. Lab use only, not for loan off-site.', '[{"label":"Bandwidth","value":"100 MHz"},{"label":"Channels","value":"2"}]'::jsonb, 1, 1, true),
  ('ARTL-MT-020', 'Servo', 'MG996R', 'Motor', 'High-torque metal gear servo.', '[{"label":"Torque","value":"11 kg·cm"},{"label":"Supply","value":"6 V"}]'::jsonb, 6, 6, false),
  ('ARTL-MC-009', 'Raspberry Pi', '4B', 'Microcontroller', 'Single board computer, 4 GB. Runs the vision experiments.', '[{"label":"RAM","value":"4 GB"},{"label":"SoC","value":"BCM2711"}]'::jsonb, 3, 3, false),
  ('ARTL-SN-005', 'Ultrasonic', 'HC-SR04', 'Sensor', 'Ultrasonic range finder.', '[{"label":"Range","value":"2–400 cm"}]'::jsonb, 11, 11, false),
  ('ARTL-MC-015', 'ESP32', 'DevKit v1', 'Microcontroller', 'Wi-Fi and Bluetooth on one die. Preferred over the Uno when anything needs a network.', '[{"label":"Cores","value":"2 × 240 MHz"},{"label":"Radio","value":"Wi-Fi + BLE"}]'::jsonb, 8, 5, false),
  ('ARTL-MC-022', 'STM32', 'Nucleo F401RE', 'Microcontroller', 'ARM Cortex-M4 board for work that has outgrown the AVR.', '[{"label":"Core","value":"Cortex-M4"},{"label":"Clock","value":"84 MHz"}]'::jsonb, 4, 4, false),
  ('ARTL-SN-011', 'IMU', 'MPU-6050', 'Sensor', 'Six-axis accelerometer and gyroscope. Attitude sensing for the rover and the drone rigs.', '[{"label":"Axes","value":"6"},{"label":"Bus","value":"I²C"}]'::jsonb, 9, 2, false),
  ('ARTL-SN-018', 'LiDAR', 'RPLIDAR A1', 'Sensor', '360° laser scanner used for the mapping experiments. Booked out most weeks.', '[{"label":"Range","value":"12 m"},{"label":"Rate","value":"5.5 Hz"}]'::jsonb, 1, 0, false),
  ('ARTL-SN-030', 'Depth Camera', 'Intel RealSense D435', 'Sensor', 'Stereo depth camera. Sign-out requires a coordinator present.', '[{"label":"Depth FOV","value":"87° × 58°"}]'::jsonb, 1, 1, false),
  ('ARTL-MT-027', 'Brushless Motor', 'A2212 1000 KV', 'Motor', 'Outrunner for the fixed-wing and quadrotor airframes.', '[{"label":"KV","value":"1000"}]'::jsonb, 12, 8, false),
  ('ARTL-MT-033', 'ESC', '30 A', 'Motor', 'Electronic speed controller, matched to the A2212.', '[]'::jsonb, 12, 9, false),
  ('ARTL-MT-041', 'Stepper', 'NEMA 17', 'Motor', 'Bipolar stepper for the plotter and the gantry rig.', '[{"label":"Step","value":"1.8°"}]'::jsonb, 10, 10, false),
  ('ARTL-PW-014', 'Bench Supply', '0–30 V 5 A', 'Power', 'Variable bench supply. Two channels, current limited.', '[]'::jsonb, 2, 2, true),
  ('ARTL-PW-021', 'LiPo Charger', 'iMAX B6', 'Power', 'Balance charger. Never leave a pack on it unattended.', '[]'::jsonb, 2, 1, false),
  ('ARTL-TL-004', 'Soldering Station', 'Hakko FX-888D', 'Instrument', 'Temperature-controlled iron. Four stations on the main bench.', '[]'::jsonb, 4, 3, true),
  ('ARTL-TL-012', 'Multimeter', 'Fluke 117', 'Instrument', 'True-RMS handheld. Sign out for field testing.', '[]'::jsonb, 5, 2, false),
  ('ARTL-TL-019', 'Logic Analyser', '8-channel', 'Instrument', 'USB logic analyser for bus debugging.', '[{"label":"Channels","value":"8"},{"label":"Rate","value":"24 MS/s"}]'::jsonb, 2, 2, false),
  ('ARTL-TL-040', '3D Printer', 'Prusa MK4', 'Instrument', 'FDM printer. Queue is managed by the lab manager, not by loan.', '[{"label":"Volume","value":"250 × 210 × 220 mm"}]'::jsonb, 2, 1, true),
  ('ARTL-TL-047', 'Rotary Tool', 'Dremel 4000', 'Instrument', 'Cutting and finishing. Eye protection is not optional.', '[]'::jsonb, 3, 3, false),
  ('ARTL-MD-008', 'Motor Driver', 'L298N', 'Module', 'Dual H-bridge. The rover''s original drive stage.', '[]'::jsonb, 14, 11, false),
  ('ARTL-MD-016', 'GPS Module', 'NEO-6M', 'Module', 'UART GPS receiver with a patch antenna.', '[]'::jsonb, 4, 4, false),
  ('ARTL-MD-025', 'LoRa Module', 'SX1278 433 MHz', 'Module', 'Long-range telemetry for the field trials.', '[{"label":"Band","value":"433 MHz"}]'::jsonb, 6, 3, false),
  ('ARTL-CM-002', 'Breadboard', '830 point', 'Component', 'Full-size solderless breadboard.', '[]'::jsonb, 24, 19, false),
  ('ARTL-CM-009', 'Jumper Set', 'M-M / M-F / F-F', 'Component', 'Assorted jumper leads, 120 per set.', '[]'::jsonb, 20, 20, false),
  ('ARTL-CM-017', 'Resistor Kit', 'E12, 1/4 W', 'Component', 'Full E12 decade set, 600 pieces.', '[]'::jsonb, 6, 6, false),
  ('ARTL-AE-001', 'Airframe', '450 mm quad', 'Airframe', 'Carbon quadrotor frame for the aerial trials.', '[]'::jsonb, 3, 1, false),
  ('ARTL-AE-006', 'Flight Controller', 'Pixhawk 4 mini', 'Airframe', 'Autopilot for the quad and the fixed-wing testbed.', '[]'::jsonb, 2, 2, false),
  ('ARTL-AE-013', 'Propeller Set', '1045', 'Airframe', 'Balanced 10 × 4.5 props, four per set.', '[]'::jsonb, 15, 12, false)
on conflict (code) do update set name = excluded.name, variant = excluded.variant, category = excluded.category, description = excluded.description, specs = excluded.specs, bench_only = excluded.bench_only;

insert into projects (slug, title, subtitle, body, tags, year, sort_order, published) values
  ('minirover-1', 'MiniRover-1', 'rocker-bogie', 'Six-wheeled rover on a rocker-bogie mechanism. When one rocker arm rises the differential drives the other down, holding the chassis level across ground that would tip a rigid frame. At least four wheels stay in contact at all times. Six 300 RPM motors, DPDT wired control, migrating to HC-05 Bluetooth. The next revision targets gesture control via OpenCV.', array['Rocker-bogie', '300 RPM ×6', 'DPDT control', 'HC-05 next']::text[], 2026, 1, true),
  ('differential-linkage-rig', 'Differential linkage rig', 'test bench', 'Bench rig built to prove the differential before it ever went on the rover. Balances motion between left and right rockers and keeps the body stable.', array['Mechanism', 'Test rig']::text[], 2026, 2, true),
  ('gesture-control', 'Gesture control', 'computer vision', 'A computer-vision layer that reads hand gestures and maps them to drive commands. The next revision targets full autonomy.', array['OpenCV', 'Machine learning', 'In progress']::text[], 2026, 3, true),
  ('wireless-drive-stack', 'Wireless drive stack', 'HC-05 migration', 'Migration from wired DPDT switching to Bluetooth control over HC-05, keeping the same motor-driver topology.', array['HC-05', 'Embedded C']::text[], 2026, 4, true)
on conflict (slug) do nothing;

insert into events (external_id, title, starts_at, description, link_url, published) values
  ('69640c109ca5d7968fed571d', 'Development Hackathon', '2025-12-28T00:00:00.000Z', null, null, true),
  ('69640bd59ca5d7968fed5715', 'MLCodefest', '2026-01-10T00:00:00.000Z', null, 'https://unstop.com/hackathons/mlcodefest-indian-institute-of-technology-iit-jodhpur-1602702', true),
  ('69640bb29ca5d7968fed5711', 'Cryptic Hunt', '2026-01-10T00:00:00.000Z', null, 'https://unstop.com/competitions/cryptic-hunt-prometeo26-indian-institute-of-technology-iit-jodhpur-1602891', true),
  ('69640b009ca5d7968fed56f9', 'CADastra', '2026-01-10T00:00:00.000Z', null, 'https://unstop.com/competitions/cadastra-indian-institute-of-technology-iit-jodhpur-1602700', true),
  ('696409fbbb217904d0d80436', 'Kaggle Knight', '2026-01-12T00:00:00.000Z', null, 'https://unstop.com/hackathons/kaggle-knight-indian-institute-of-technology-iit-jodhpur-1602694', true),
  ('69640b909ca5d7968fed570d', 'GameJam', '2026-01-16T00:00:00.000Z', null, 'https://unstop.com/hackathons/gamejam-indian-institute-of-technology-iit-jodhpur-1602668', true),
  ('69640b6e9ca5d7968fed5709', 'Micromouse Autonomous Bot Making Competition', '2026-01-16T00:00:00.000Z', null, 'https://unstop.com/competitions/micromouse-autonomous-bot-making-competition-indian-institute-of-technology-iit-jodhpur-1602683', true),
  ('69640b399ca5d7968fed5701', 'Boat Racing', '2026-01-16T00:00:00.000Z', null, 'https://unstop.com/competitions/boat-racing-indian-institute-of-technology-iit-jodhpur-1602691', true),
  ('69640b1b9ca5d7968fed56fd', 'Pick and Place', '2026-01-16T00:00:00.000Z', null, 'https://unstop.com/competitions/pick-and-place-indian-institute-of-technology-iit-jodhpur-1602672', true),
  ('69640ae69ca5d7968fed56f5', 'Line Follower Bot Competition', '2026-01-16T00:00:00.000Z', null, 'https://unstop.com/competitions/line-follower-bot-competition-prometeo26-indian-institute-of-technology-iit-jodhpur-1602676', true),
  ('69640ace9ca5d7968fed56f1', 'Capture the Flag (CTF)', '2026-01-16T00:00:00.000Z', null, 'https://unstop.com/hackathons/capture-the-flag-prometeo26-indian-institute-of-technology-iit-jodhpur-1612072', true),
  ('69640ab59ca5d7968fed56ed', 'Robo Soccer', '2026-01-16T00:00:00.000Z', null, 'https://unstop.com/competitions/robo-soccer-indian-institute-of-technology-iit-jodhpur-1602714', true),
  ('69640a959ca5d7968fed56e9', 'RC Electric Racing', '2026-01-16T00:00:00.000Z', null, 'https://unstop.com/competitions/rc-electric-racing-indian-institute-of-technology-iit-jodhpur-1602706', true),
  ('69640a6a9ca5d7968fed56e5', 'Drone Cargo', '2026-01-16T00:00:00.000Z', null, 'https://unstop.com/competitions/drone-cargo-challenge-indian-institute-of-technology-iit-jodhpur-1602666', true),
  ('69640a259ca5d7968fed56e1', 'Robowars', '2026-01-16T00:00:00.000Z', null, 'https://unstop.com/competitions/robowars-indian-institute-of-technology-iit-jodhpur-1602692', true),
  ('69640bf09ca5d7968fed5719', 'Code Wars', '2026-01-17T00:00:00.000Z', null, 'https://unstop.com/hackathons/code-wars-indian-institute-of-technology-iit-jodhpur-1602677', true),
  ('69640b559ca5d7968fed5705', 'Battle of Traders', '2026-01-17T00:00:00.000Z', null, 'https://unstop.com/competitions/battle-of-traders-indian-institute-of-technology-iit-jodhpur-1602687', true)
on conflict (external_id) do nothing;

insert into members (full_name, role_label, department, photo_url, linkedin_url, email, sort_order, is_placeholder) values
  ('Yash Golani', 'General Secretary ACAC', 'Student Affairs', '/images/team/yash.jpeg', 'https://www.linkedin.com/in/yash-golani-144210106/', 'gensecy_acac@iitj.ac.in', 1, false),
  ('Tharakadatta G Hegde', 'General Secretary SS', 'Student Affairs', '/images/team/tharak.jpeg', 'https://www.linkedin.com/in/tharakadattahegde/', 'gensecy_ss@iitj.ac.in', 2, false),
  ('Manas Chechani', 'General Secretary SAC', 'Student Affairs', '/images/team/manas.jpeg', 'https://www.linkedin.com/in/manas-chechani-1452ab253/', 'gensecy_sac@iitj.ac.in', 3, false),
  ('Sambhav Jha', 'VP BCCA', 'Student Affairs', '/images/team/sambhav.jpeg', 'https://www.linkedin.com/in/sambhav-jha-61412528a/', 'b23ee1092@iitj.ac.in', 4, false),
  ('Dhruva Kumar Kaushal', 'Coordinating Team', 'Student Team', '/images/team/dhruva.jpeg', 'https://www.linkedin.com/in/dhruvakkaushal/', 'b22ai017@iitj.ac.in', 5, false),
  ('Rhythm Baghel', 'Coordinating Team', 'Student Team', '/images/team/rhythm.jpeg', 'https://www.linkedin.com/in/rhythm-baghel-80675a25a/', 'b22cs042@iitj.ac.in', 6, false),
  ('Anuj Patil', 'Coordinating Team', 'Student Team', '/images/team/anuj.jpeg', 'https://www.linkedin.com/in/anuj-vijay-patil/', 'b22ee010@iitj.ac.in', 7, false),
  ('Mrudhul Tula', 'Core Team', 'Student Team', '/images/team/mrudhul.jpeg', 'https://www.linkedin.com/in/tula-mrudhul/', 'b23ee1076@iitj.ac.in', 8, false),
  ('Sohom Sarkar', 'Core Team', 'Student Team', '/images/team/sohom.jpeg', 'https://www.linkedin.com/in/sohom-sarkar-598b9b2aa/', 'b23ee1099@iitj.ac.in', 9, false),
  ('Agam Harpreet Singh', 'Core Team', 'Student Team', '/images/team/agam.jpeg', 'https://www.linkedin.com/in/agam-harpreet-singh/', 'b23cm1004@iitj.ac.in', 10, false),
  ('Goutham A.S', 'Core Team', 'Student Team', '/images/team/goutham.jpeg', 'https://www.linkedin.com/in/goutham-a-s-93b30b312/', 'b23ee1024@iitj.ac.in', 11, false),
  ('Tashir Ahmed', 'Core Team', 'Student Team', '/images/team/tashir.jpeg', 'https://www.linkedin.com/in/tashir-ahmed-5315b128b/', 'b23me1074@iitj.ac.in', 12, false);


commit;